
const fun = (str) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(Date.UTC(year, month - 1, day))
}


const ans = "01/08/2025";

console.log(fun(ans));