document.addEventListener("DOMContentLoaded", () => {
  loadFinishedGoods();
});

async function loadFinishedGoods() {
  try {
    const res = await fetch("http://localhost:5000/api/finished-goods");
    const data = await res.json();

    const tbody = document.getElementById("finishedGoodsTableBody");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
        <tr>
          <td>${item.sku}</td>
          <td>${item.name}</td>
          <td>${item.type}</td>
          <td>${item.size}</td>
          <td>${item.grade}</td>
          <td>${item.mediaType}</td>
          <td>${item.stock}</td>
          <td>${item.location}</td>
          <td>
            <span class="badge bg-${item.stock < 10 ? "danger" : "success"}">
              ${item.stock < 10 ? "Low Stock" : "In Stock"}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary">Edit</button>
            <button class="btn btn-sm btn-outline-danger">Delete</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });

  } catch (err) {
    console.error("Error loading finished goods:", err);
  }
}
