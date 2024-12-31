function formatDateTime(isoString) {
    const date = new Date(isoString);

    // Format date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString(undefined, options);

    // Format time with 12-hour format and AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight

    const formattedTime = `${hours}:${minutes}:${seconds} ${amPm}`;

    return `${formattedDate}, ${formattedTime}`;
}


export default formatDateTime

// Example usage
// const inputDate = "2024-12-11T10:37:16.213Z";
// console.log(formatDateTime(inputDate));
