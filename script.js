function hatterValtas() {
    const szinek = ["lightblue", "lightgreen", "lightpink", "beige", "lavender"];
    const randomIndex = Math.floor(Math.random() * szinek.length);
    document.body.style.backgroundColor = szinek[randomIndex];
}

function toggleSzoveg() {
    const szoveg = document.getElementById("titkos");
    if (szoveg.style.display === "none") {
        szoveg.style.display = "block";
    } else {
        szoveg.style.display = "none";
    }
}

document.addEventListener("mousemove", function(e) {
    const felirat = document.getElementById("mozgofelirat");
    felirat.style.left = e.pageX + "px";
    felirat.style.top = e.pageY + "px";
});