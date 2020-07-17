import { createSnackbar } from '@snackbar/core'
import jQuery             from 'jquery'
import Cleave             from 'cleave.js'
import Validator          from './validator'
import { POST }           from './utils/request'

export default class App {
  constructor() {
    this.url                 = 'http://localhost:3009/payment_callbacks/1/test' // FIXME:: ссылка, куда отправляются данные карты
    this.$input_card_number  = null
    this.$input_card_month   = null
    this.$input_card_year    = null
    this.$input_card_cvc     = null
    this.$btn_submit         = null
    this.invalid_count       = 0
    this.full_fill_count     = 0
    this.on_send_done        = this.on_send_done.bind(this)

    this.init()
  }


  init() {
    //region находим и фиксируем поля ввода формы
    let i, name, len = App.inputs.length, $input
    for (i = 0; i < len; i++) {
      name = `card_${App.inputs[i]}`
      this[`$input_${name}`] = $input = jQuery(`input[name=${name}]`)
      $input.on('input', this.on_input_change.bind(this))
      //console.log(this[`$input_${name}`].length)
    }
    //endregion

    // фиксируем кнопку "оплатить"
    this.$btn_submit = jQuery('button.Button')
    this.$btn_submit.on('click', this.on_submit_click.bind(this))

    // настраиваем маску
    new Cleave('input[name="card_number"]', { creditCard: true })
  }


  // слушает изменения в полях ввода
  on_input_change() {
    // console.log('on_input_change')
    // data
    this.detect_invalid_count()
    this.detect_full_fill_count()
    // view
    this.redraw_submit_button()
    this.redraw_input_fields()
  }


  // сколько невалидных полей?
  detect_invalid_count() {
    let i, name, value, len = App.inputs.length, is_valid, invalid_count = len
    for (i = 0; i < len; i++) {
      name     = `card_${App.inputs[i]}`
      value    = this[`$input_${name}`].val()
      is_valid = Validator[`validate_${name}`](value)
      if (is_valid) invalid_count--
      //console.log(`${name} = ${value}; valid? = ${is_valid}`)
    }
    // console.log('-------- invalid_count = ' + invalid_count)
    this.invalid_count = invalid_count
  }


  // если все поля валидны - кнопка нажимаема
  redraw_submit_button() {
    if (this.invalid_count === 0) {
      this.$btn_submit.removeClass('disabled')
    } else {
      this.$btn_submit.addClass('disabled')
    }
  }


  // сколько полностью заполненных полей?
  detect_full_fill_count() {
    let i, len = App.inputs.length, name, value, is_full_fill, full_fill_count = 0
    for (i = 0; i < len; i++) {
      name         = `card_${App.inputs[i]}`
      value        = this[`$input_${name}`].val()
      is_full_fill = Validator.is_full_fill(name, value)
      if (is_full_fill) full_fill_count++
      //console.log(`${name} = ${value}; filled? = ${is_full_fill}`)
    }
    // console.log('-------- full_fill_count = ' + full_fill_count)
    this.full_fill_count = full_fill_count
  }


  // если все поля заполнены и есть ошибки - покажем их
  redraw_input_fields() {
    if (this.full_fill_count === App.inputs.length) {
      this.invalid_count > 0 ? this.highlight_wrong_inputs() : this.clear_highlight_wrong_inputs()
    } else {
      this.clear_highlight_wrong_inputs()
    }
  }


  // подсветим неверно заполненные поля
  highlight_wrong_inputs() {
    let i, len = App.inputs.length, name, value, is_valid, $input
    for (i = 0; i < len; i++) {
      name     = `card_${App.inputs[i]}`
      $input   = this[`$input_${name}`]
      value    = $input.val()
      is_valid = Validator[`validate_${name}`](value)
      if (!is_valid) {
        $input.closest('.iwrapper').addClass('error')
      }
      //console.log(`${name} = ${value}; filled? = ${is_full_fill}`)
    }
  }


  clear_highlight_wrong_inputs() {
    jQuery('.iwrapper').removeClass('error')
  }


  // нажали по кнопке submit
  on_submit_click(e) {
    e.preventDefault()
    this.sending = true
    this.send_data()
  }


  // готовим данные для отправки
  prepare_data() {
    let data = {}
    let i, name, value, len = App.inputs.length
    for (i = 0; i < len; i++) {
      name       = `card_${App.inputs[i]}`
      value      = this[`$input_${name}`].val()
      data[name] = Validator[`prepare_${name}`](value)
    }
    //console.log(JSON.stringify(data), null, 2)
    return data
  }


  send_data() {
    POST(this.url, this.prepare_data()).then(this.on_send_done)
  }


  // TODO:: указать реальную платёжную ссылку и имплементировать обработку ответа
  on_send_done(response) {
    if(response.errors) {
      this.growl(response.errors[Object.keys(response.errors)[0]])
    } else {
      this.growl('PAID')
    }
    this.sending = false
  }


  set sending(value) {
    this._sending = value
    if (value) {
      this.$btn_submit.addClass('disabled')
      this.$btn_submit.addClass('sending')
    } else {
      this.$btn_submit.removeClass('disabled')
      this.$btn_submit.removeClass('sending')
    }
  }


  get sending() {
    return this._sending
  }


  growl(message) {
    createSnackbar(message, {
      timeout:  10000,
      position: 'left',
      actions:  []
    })
  }
}

App.inputs = 'number,month,year,cvc'.split(',')
