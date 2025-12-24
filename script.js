const itemInputs = document.getElementById("itemInputs");
const invoiceItems = document.getElementById("invoiceItems");

let invoiceCounter = Number(localStorage.getItem("invoiceCounter")) || 87;

document.getElementById("invoiceNoInput").value = invoiceCounter;
document.getElementById("invoiceNo").innerText = invoiceCounter;

function generateInvoiceNumber() {
  invoiceCounter++;
  localStorage.setItem("invoiceCounter", invoiceCounter);
  invoiceNoInput.value = invoiceCounter;
  invoiceNo.innerText = invoiceCounter;
}

function addItem() {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input></td>
    <td><input></td>
    <td><input></td>
    <td><input type="number" value="1"></td>
    <td><input type="number" value="0"></td>
    <td><button onclick="this.parentElement.parentElement.remove()">❌</button></td>
  `;
  itemInputs.appendChild(row);
}

function updateInvoice() {
  invoiceItems.innerHTML = "";

  const gstRateValue = Number(document.getElementById("gstRate").value) || 0;
  const halfGST = gstRateValue / 2 / 100;

  let subtotal = 0;
  let totalCGST = 0;
  let totalSGST = 0;

  [...itemInputs.children].forEach((row, i) => {
    const desc = row.children[0].children[0].value;
    const hsn  = row.children[1].children[0].value;
    const uom  = row.children[2].children[0].value;
    const qty  = Number(row.children[3].children[0].value) || 0;
    const rate = Number(row.children[4].children[0].value) || 0;

    const taxable = qty * rate;
    const cgst = taxable * halfGST;
    const sgst = taxable * halfGST;
    const total = taxable + cgst + sgst;

    subtotal += taxable;
    totalCGST += cgst;
    totalSGST += sgst;

    invoiceItems.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${desc}</td>
        <td>${hsn}</td>
        <td>${uom}</td>
        <td>${qty}</td>
        <td>${rate.toFixed(2)}</td>
        <td>${taxable.toFixed(2)}</td>
        <td>${cgst.toFixed(2)}</td>
        <td>${sgst.toFixed(2)}</td>
        <td>${total.toFixed(2)}</td>
      </tr>
    `;
  });

  // ---- Update header info ----
  document.getElementById("invoiceNo").innerText =
    document.getElementById("invoiceNoInput").value;

  document.getElementById("buyerDisplay").innerText =
    document.getElementById("buyerName").value;

  document.getElementById("buyerAddressDisplay").innerText =
    document.getElementById("buyerAddress").value;

  document.getElementById("buyerGSTDisplay").innerText =
    document.getElementById("buyerGST").value;

  // ---- Totals ----
  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("cgst").innerText = totalCGST.toFixed(2);
  document.getElementById("sgst").innerText = totalSGST.toFixed(2);

  const grandTotal = subtotal + totalCGST + totalSGST;
  document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);

  document.getElementById("amountWords").innerText =
    numberToWords(Math.round(grandTotal));
}

function newInvoice() {
  document.querySelectorAll("input, textarea").forEach(i => i.value = "");
  itemInputs.innerHTML = "";
  addItem();
  generateInvoiceNumber();
}

function saveInvoice() {
  const data = {
    invoiceNo: invoiceNoInput.value,
    buyerName: buyerName.value,
    buyerAddress: buyerAddress.value,
    buyerGST: buyerGST.value,
    gstRate: gstRate.value,
    items: [...itemInputs.children].map(r => ({
      desc: r.children[0].children[0].value,
      hsn: r.children[1].children[0].value,
      uom: r.children[2].children[0].value,
      qty: r.children[3].children[0].value,
      rate: r.children[4].children[0].value
    }))
  };

  localStorage.setItem("invoice_" + data.invoiceNo, JSON.stringify(data));
  loadSavedList();
}

function loadSavedList() {
  savedInvoices.innerHTML = `<option value="">Load Saved Invoice</option>`;
  Object.keys(localStorage)
    .filter(k => k.startsWith("invoice_"))
    .forEach(k => {
      savedInvoices.innerHTML += `<option value="${k}">${k}</option>`;
    });
}

function loadInvoice(key) {
  if (!key) return;
  const d = JSON.parse(localStorage.getItem(key));

  invoiceNoInput.value = d.invoiceNo;
  buyerName.value = d.buyerName;
  buyerAddress.value = d.buyerAddress;
  buyerGST.value = d.buyerGST;
  gstRate.value = d.gstRate;

  itemInputs.innerHTML = "";
  d.items.forEach(i => {
    addItem();
    const r = itemInputs.lastChild;
    r.children[0].children[0].value = i.desc;
    r.children[1].children[0].value = i.hsn;
    r.children[2].children[0].value = i.uom;
    r.children[3].children[0].value = i.qty;
    r.children[4].children[0].value = i.rate;
  });

  updateInvoice();
}

function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

function numberToWords(num) {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function w(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + w(n % 100);
    if (n < 100000) return w(Math.floor(n / 1000)) + " Thousand " + w(n % 1000);
    if (n < 10000000) return w(Math.floor(n / 100000)) + " Lakh " + w(n % 100000);
    return w(Math.floor(n / 10000000)) + " Crore " + w(n % 10000000);
  }

  return w(num) + " Only";
}

addItem();
loadSavedList();
