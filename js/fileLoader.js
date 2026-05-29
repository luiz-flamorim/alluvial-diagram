export function setupFileLoader(callback) {
  const input = document.getElementById("fileInput");

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const text = e.target.result;

      const data = d3.csvParse(text); // ✅ already parsed
      callback(data);
    };

    reader.readAsText(file);
  });
}