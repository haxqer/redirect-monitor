package main

import (
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type RedirectStep struct {
	URL        string `json:"url"`
	StatusCode int    `json:"status_code"`
	Method     string `json:"method"`
	Headers    map[string]string `json:"headers,omitempty"`
	Timestamp  string `json:"timestamp"`
}

type RedirectResult struct {
	OriginalURL   string         `json:"original_url"`
	FinalURL      string         `json:"final_url"`
	Steps         []RedirectStep `json:"steps"`
	TotalSteps    int            `json:"total_steps"`
	TotalDuration string         `json:"total_duration"`
	Success       bool           `json:"success"`
	Error         string         `json:"error,omitempty"`
}

func main() {
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Serve static files
	r.Static("/static", "./static")
	r.LoadHTMLGlob("templates/*")

	// Routes
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "URL Redirect Monitor",
		})
	})

	r.POST("/api/check-redirects", handleRedirectCheck)

	fmt.Println("Server starting on :8080")
	r.Run(":8080")
}

func handleRedirectCheck(c *gin.Context) {
	var request struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Validate URL
	if _, err := url.Parse(request.URL); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL format"})
		return
	}

	// Track redirects
	result := trackRedirects(request.URL)
	c.JSON(http.StatusOK, result)
}

func trackRedirects(originalURL string) RedirectResult {
	startTime := time.Now()
	result := RedirectResult{
		OriginalURL: originalURL,
		Steps:       []RedirectStep{},
		Success:     false,
	}

	// Create HTTP client that doesn't follow redirects automatically
	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
		Timeout: 30 * time.Second,
	}

	currentURL := originalURL
	maxRedirects := 20 // Prevent infinite redirect loops

	for i := 0; i < maxRedirects; i++ {
		req, err := http.NewRequest("GET", currentURL, nil)
		if err != nil {
			result.Error = fmt.Sprintf("Failed to create request: %v", err)
			break
		}

		// Set user agent
		req.Header.Set("User-Agent", "Redirect-Monitor/1.0")

		resp, err := client.Do(req)
		if err != nil {
			result.Error = fmt.Sprintf("Request failed: %v", err)
			break
		}

		// Extract relevant headers
		headers := make(map[string]string)
		if location := resp.Header.Get("Location"); location != "" {
			headers["Location"] = location
		}
		if server := resp.Header.Get("Server"); server != "" {
			headers["Server"] = server
		}
		if cacheControl := resp.Header.Get("Cache-Control"); cacheControl != "" {
			headers["Cache-Control"] = cacheControl
		}

		step := RedirectStep{
			URL:        currentURL,
			StatusCode: resp.StatusCode,
			Method:     "GET",
			Headers:    headers,
			Timestamp:  time.Now().Format("2006-01-02 15:04:05"),
		}

		result.Steps = append(result.Steps, step)
		resp.Body.Close()

		// Check if this is a redirect
		if resp.StatusCode >= 300 && resp.StatusCode < 400 {
			location := resp.Header.Get("Location")
			if location == "" {
				result.Error = "Redirect response without Location header"
				break
			}

			// Handle relative URLs
			if parsedLocation, err := url.Parse(location); err == nil {
				if !parsedLocation.IsAbs() {
					if baseURL, err := url.Parse(currentURL); err == nil {
						location = baseURL.ResolveReference(parsedLocation).String()
					}
				}
			}

			currentURL = location
		} else {
			// Not a redirect, we've reached the final destination
			result.Success = true
			result.FinalURL = currentURL
			break
		}
	}

	if len(result.Steps) >= maxRedirects {
		result.Error = "Too many redirects (possible infinite loop)"
	}

	if result.FinalURL == "" {
		result.FinalURL = currentURL
	}

	result.TotalSteps = len(result.Steps)
	duration := time.Since(startTime)
	
	// Format duration to show only 2 decimal places
	if duration < time.Microsecond {
		result.TotalDuration = fmt.Sprintf("%.2fns", float64(duration.Nanoseconds()))
	} else if duration < time.Millisecond {
		result.TotalDuration = fmt.Sprintf("%.2fµs", float64(duration.Nanoseconds())/1000.0)
	} else if duration < time.Second {
		result.TotalDuration = fmt.Sprintf("%.2fms", float64(duration.Nanoseconds())/1000000.0)
	} else {
		result.TotalDuration = fmt.Sprintf("%.2fs", duration.Seconds())
	}

	return result
} 