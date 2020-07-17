import {zeroPad} from "./utils/zero_pad";

export default class Validator {

  // валидация

  static validate_card_number(value) {
    const normalized = this.normalize_digit(value)
    return normalized.length === 16
  }

  static validate_card_month(value) {
    const normalized = this.normalize_digit(value)
    return normalized.length === 2 && +normalized > 0 && +normalized <= 12
  }

  static validate_card_year(value) {
    const normalized = this.normalize_digit(value)
    return normalized.length === 2 && +normalized >= 20 && +normalized <= 50
  }

  static validate_card_cvc(value) {
    const normalized = this.normalize_digit(value)
    return normalized.length === 3
  }

  // вернёт true, если поле (из которого берутся только цифры) полностью заполнено

  static is_full_fill(field, value) {
    const normalized = this.normalize_digit(value)
    return normalized.length === this.MAX_LENGTH[field]
  }

  // подготовка к отправке на сервер
  static prepare_card_number(value) { return this.normalize_digit(value) }
  static prepare_card_month(value)  { return zeroPad(value, 2) }
  static prepare_card_year(value)   { return value }
  static prepare_card_cvc(value)    { return value }

  // utils

  static normalize_digit(value) {
    return value.split(this.RX_NOT_DIGIT).join('')
  }
}

Validator.RX_NOT_DIGIT = /[^\d]/
Validator.MAX_LENGTH = {
  card_number: 16,
  card_month:  2,
  card_year:   2,
  card_cvc:    3
}
