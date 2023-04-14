let time = require("date-fns");
let today = new Date("2022-3-30");
console.log(today);
let new_date = time.format(today, "yyyy-MM-dd");
console.log(new_date);
function stringToDate(given) {
  let temp = new Date(given);
  let result = time.format(temp, "yyyy-MM-dd");
  return result;
}
