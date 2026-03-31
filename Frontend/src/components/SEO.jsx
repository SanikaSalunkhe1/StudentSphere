import React, { useEffect } from "react";

const SEO = ({ title, description, url, image }) => {
  useEffect(() => {
    // Update Document Title
    if (title) {
      document.title = title;
    }

    // Helper function to update meta tags
    const updateMetaTag = (name, property, value) => {
      if (!value) return;
      
      let element;
      if (name) {
        element = document.querySelector(`meta[name="${name}"]`);
      } else if (property) {
        element = document.querySelector(`meta[property="${property}"]`);
      }

      if (!element) {
        element = document.createElement("meta");
        if (name) element.setAttribute("name", name);
        if (property) element.setAttribute("property", property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", value);
    };

    // Standard Meta Tags
    updateMetaTag("description", null, description);
    
    // Open Graph / Facebook
    updateMetaTag(null, "og:type", "website");
    updateMetaTag(null, "og:url", window.location.origin + url);
    updateMetaTag(null, "og:title", title);
    updateMetaTag(null, "og:description", description);
    if (image) updateMetaTag(null, "og:image", window.location.origin + image);

    // Twitter
    updateMetaTag("twitter:card", null, "summary_large_image");
    updateMetaTag("twitter:url", null, window.location.origin + url);
    updateMetaTag("twitter:title", null, title);
    updateMetaTag("twitter:description", null, description);
    if (image) updateMetaTag("twitter:image", null, window.location.origin + image);

  }, [title, description, url, image]);

  return null;
};

export default SEO;
