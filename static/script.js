
function drawTextOnCanvas(canvas, text) {
    if (!text || !text.trim()) return;
  
    const ctx = canvas.getContext("2d");
    ctx.font = "28px sans-serif";
    ctx.fillStyle = "#ffffff";  // White text
    ctx.strokeStyle = "#000000"; // Black outline
    ctx.lineWidth = 3;
  
    // Position near top-left
    const x = 20;
    const y = 40;
  
    // Outline
    ctx.strokeText(text, x, y);
    // Fill
    ctx.fillText(text, x, y);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const promptInput = document.getElementById("prompt");
    const overlayInput = document.getElementById("overlayText");
    const generateBtn = document.getElementById("generateBtn");
    const canvas = document.getElementById("memeCanvas");
    const errorMsg = document.getElementById("errorMsg");
  
    /**
     * Handle Generate Meme button
     */
    generateBtn.addEventListener("click", async () => {
      errorMsg.textContent = ""; // Clear any old errors
      const promptValue = promptInput.value.trim();
      const overlayValue = overlayInput.value.trim();
  
      if (!promptValue) {
        errorMsg.textContent = "Please enter a meme prompt first.";
        return;
      }
  
      // Disable button, show "Generating..."
      generateBtn.disabled = true;
      generateBtn.textContent = "Generating...";
  
      try {
        // 1) Send the prompt (and overlay text) to our Flask backend
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptValue, overlayText: overlayValue })
        });
  
        if (!response.ok) {
          // If server returned an error status
          const errData = await response.json();
          throw new Error(errData.error || "Server error");
        }
  
        // 2) Parse JSON
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
  
        if (!data.image) {
          throw new Error("No image was returned by the server.");
        }
  
        // 3) Convert base64 -> Blob -> Object URL -> Load into <canvas>
        const base64Response = await fetch(`data:image/png;base64,${data.image}`);
        const blob = await base64Response.blob();
        const img = new Image();
        const blobURL = URL.createObjectURL(blob);
  
        img.onload = function() {
          // Resize canvas to match the image
          canvas.width = img.width;
          canvas.height = img.height;
  
          // Draw the image
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
  
          // Overlay text if provided
          if (overlayValue) {
            drawTextOnCanvas(canvas, overlayValue);
          }
  
          // Clean up
          URL.revokeObjectURL(blobURL);
        };
        img.src = blobURL;
      } catch (error) {
        errorMsg.textContent = `Error: ${error.message}`;
      } finally {
        generateBtn.textContent = "Generate Meme";
        generateBtn.disabled = false;
      }
    });
  });
  