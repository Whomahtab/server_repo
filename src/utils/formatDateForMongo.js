
const formatDateForMongo = (inputDate) => {
    try {
        const dateStr = inputDate;
        const [day, month, year] = dateStr.split('/');
        const newDate = new Date(Date.UTC(year, month - 1, day));

        const resDate = newDate.toISOString();
        return resDate;
    } catch (error) {
        console.log('can not parse date');
        return;
    }
}
export default formatDateForMongo