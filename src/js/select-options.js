const $ = require('jquery')

function setSelectLoading(select) {
    setSelectOptions(select, [{ value: 0, text: 'loading…' }])
}

function appendSelectOption(select, value, text, selected) {
    select.append($('<option>', { value, text, selected }))
}

function setSelectOptions(select, options) {
    select.find('option').remove()
    for (const option of options) {
        appendSelectOption(select, option.value, option.text, option.selected)
    }
}

module.exports = {
    setSelectLoading,
    appendSelectOption,
    setSelectOptions
}
