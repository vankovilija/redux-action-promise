export function isNumber (num: any | Number): num is Number {
    return typeof num === 'number'
}