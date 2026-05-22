package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	requestCount = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "proxy_requests_total",
			Help: "Total number of requests forwarded by the proxy",
		},
		[]string{"method", "path"},
	)
	requestLatency = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "proxy_request_latency_seconds",
			Help:    "Latency of requests forwarded by the proxy",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)
)

func main() {
	targetURL, err := url.Parse("http://localhost:8000")
	if err != nil {
		log.Fatalf("Failed to parse target URL: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(targetURL)

	// Custom Director to handle headers if needed
	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Header.Set("X-Forwarded-Host", req.Host)
		req.Header.Set("X-Origin-Proxy", "Kora-Proxy")
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/metrics" {
			promhttp.Handler().ServeHTTP(w, r)
			return
		}

		start := time.Now()
		path := r.URL.Path
		method := r.Method

		// Log request
		log.Printf("[PROXY] %s %s -> %s", method, path, targetURL.String())

		// Update metrics
		requestCount.WithLabelValues(method, path).Inc()

		// Serve Proxy
		proxy.ServeHTTP(w, r)

		// Record latency
		duration := time.Since(start).Seconds()
		requestLatency.WithLabelValues(method, path).Observe(duration)
	})

	// mTLS Readiness Placeholder
	// To enable mTLS, uncomment the following and configure certificates
	/*
	tlsConfig := &tls.Config{
		ClientAuth: tls.RequireAndVerifyClientCert,
		// RootCAs: ... load CA certs here ...
		// Certificates: []tls.Certificate{... load server cert here ...},
		MinVersion: tls.VersionTLS12,
	}
	server := &http.Server{
		Addr:      ":8080",
		Handler:   handler,
		TLSConfig: tlsConfig,
	}
	log.Println("Starting proxy with mTLS on :8080")
	log.Fatal(server.ListenAndServeTLS("", ""))
	*/

	fmt.Println("Kora Proxy Sidecar starting on :8080...")
	fmt.Printf("Forwarding to %s\n", targetURL.String())
	
	server := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}

	log.Fatal(server.ListenAndServe())
}
