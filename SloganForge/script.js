document.addEventListener('DOMContentLoaded', function() {
  // Set up tone selector buttons
  const toneButtons = document.querySelectorAll('.tone-btn');
  const toneSelect = document.createElement('select');
  toneSelect.id = 'tone';
  toneSelect.style.display = 'none';
  
  toneButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      toneButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update hidden select value
      toneSelect.value = this.dataset.tone;
    });
    
    // Initialize with professional selected
    if (button.dataset.tone === 'professional') {
      button.classList.add('active');
      toneSelect.value = 'professional';
    }
  });
  
  // Add hidden select to form
  document.querySelector('.generator-card').appendChild(toneSelect);
});

async function generateSlogan() {
  const industry = document.getElementById("industry").value;
  const tone = document.getElementById("tone").value;
  const outputDiv = document.querySelector(".slogans-container");
  const placeholder = document.querySelector(".results-placeholder");
  const generateBtn = document.getElementById("generate-btn");
  const btnText = document.querySelector(".btn-text");

  // Show loading state
  generateBtn.disabled = true;
  btnText.textContent = "Generating...";

  // Clear previous results
  outputDiv.innerHTML = '';
  placeholder.style.display = 'none';

  try {
    const response = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry, tone }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate slogans");
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    // Format and display slogans
    const slogans = data.slogans
      .split("\n")
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, ""));

    slogans.forEach((slogan, index) => {
      const card = document.createElement('div');
      card.className = 'slogan-card';
      card.innerHTML = `
        <p>"${slogan}"</p>
        <span class="tone-badge">${tone}</span>
      `;
      card.addEventListener('click', () => {
        navigator.clipboard.writeText(slogan)
          .then(() => {
            card.style.borderColor = 'var(--accent)';
            setTimeout(() => {
              card.style.borderColor = 'var(--light-gray)';
            }, 1000);
          });
      });
      outputDiv.appendChild(card);
    });

  } catch (error) {
    placeholder.style.display = 'flex';
    placeholder.innerHTML = `
      <div>
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 20px;"></i>
        <p style="color: #ff6b6b;">Error: ${error.message}</p>
      </div>
    `;
    console.error("API Error:", error);
  } finally {
    const generateBtn = document.getElementById("generate-btn");
    const btnText = document.querySelector(".btn-text");
    generateBtn.disabled = false;
    btnText.textContent = "Generate Slogans";
  }
}

// Attach event listener to the generate button
document.getElementById("generate-btn").addEventListener("click", generateSlogan);