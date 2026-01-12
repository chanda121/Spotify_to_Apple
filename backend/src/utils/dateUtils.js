export function addSecs(date, secsToAdd) {
    const newDate = new Date(date.getTime())

    newDate.setTime(date.getTime() + secsToAdd*1000)
    return newDate
}