const API_KEY = "d29lr91r01qvhsftvf50d29lr91r01qvhsftvf5g"; // Replace with your real Finnhub API key
let stockChart = null;
let refreshTimer = null;

async function getStockData() {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");

  if (!symbol) {
    resultDiv.innerHTML = "⚠ Please enter a stock symbol.";
    return;
  }

  resultDiv.innerHTML = "⏳ Fetching…";

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();

    // Check for valid data
    if (data.c === 0 && data.o === 0 && data.pc === 0) {
      resultDiv.innerHTML = "❌ Invalid symbol or no data.";
      return;
    }

   const now = new Date().toLocaleTimeString();
const price = parseFloat(data.c);
const pct = parseFloat(data.dp);
const high = parseFloat(data.h);
const low = parseFloat(data.l);
// const volume = parseFloat(data.v); // Only if available from another endpoint

if (isNaN(price) || isNaN(pct) || isNaN(high) || isNaN(low)) {
  resultDiv.innerHTML = "❌ Invalid symbol or missing data.";
  return;
}

resultDiv.innerHTML = `
   <strong>${symbol}</strong><br>
   PRICE: $${price.toFixed(2)}<br>
   CHANGE: ${pct.toFixed(2)}%<br>
   HIGH: $${high.toFixed(2)}<br>
   LOW: $${low.toFixed(2)}<br>
   ${now}
`;


    updateChart(symbol, now, price);
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "❌ Error fetching data.";
  }
}

function updateChart(symbol, label, price) {
  let canvas = document.getElementById("priceChart");

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "priceChart";
    canvas.style.width = "100%";
    canvas.style.height = "300px";
    document.querySelector(".tracker").appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");

  if (!stockChart) {
    stockChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [label],
        datasets: [{
          label: `${symbol} Price`,
          data: [price],
          fill: true,
          tension: 0.4,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.2)"
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { display: true },
          y: {
            beginAtZero: false,
            ticks: {
              callback: (v) => `$${v}`
            }
          }
        }
      }
    });
  } else {
    stockChart.data.labels.push(label);
    stockChart.data.datasets[0].data.push(price);
    stockChart.update();
  }
}

function startTracking() {
  if (refreshTimer) clearInterval(refreshTimer);
  getStockData();
  refreshTimer = setInterval(getStockData, 60000); // refresh every 60 seconds
}

document.querySelector("button").addEventListener("click", startTracking);
