
import { getByText, fireEvent } from '@testing-library/dom'

import keselect from '../keselect'

describe('Keselect', () => {
  describe('Non Ajax', () => {
    const initDOM = () => {
      const $container = document.createElement('div')

      $container.innerHTML = `
        <select name="language_id" id="languages">
          <option value="">Select Language</option>
          <option value="1">Bahasa Indonesia</option>
          <option value="2">Arabic</option>
          <option value="3">English</option>
          <option value="4">Japanese</option>
          <option value="5">Chinese</option>
          <option value="6">Russian</option>
        </select>
      `

      const $select = $container.querySelector('select')

      return keselect($select)
    }

    it('should open the dropdown and select an option', () => {
      const $select = initDOM()
      const $selected = $select.querySelector('.keselect__selected')
      const $messageWrapper = $select.querySelector('.keselect__message-wrapper')
      const $dropdown = $select.querySelector('.keselect__dropdown')

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      getByText($dropdown, 'Japanese').click()

      expect($selected).toHaveTextContent('Japanese')
      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect($messageWrapper).toHaveClass('keselect__message-wrapper--hide')
    })

    it('should filter the option list and select an option that found', () => {
      const $select = initDOM()
      const $selected = $select.querySelector('.keselect__selected')
      const $search = $select.querySelector('.keselect__search')
      const $messageWrapper = $select.querySelector('.keselect__message-wrapper')
      const $dropdown = $select.querySelector('.keselect__dropdown')

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.input($search, {
        target: {
          value: 'Japanese'
        }
      })

      getByText($dropdown, 'Japanese').click()

      expect($selected).toHaveTextContent('Japanese')
      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect($messageWrapper).toHaveClass('keselect__message-wrapper--hide')
    })

    it('should filter the option list and not found an option', () => {
      const $select = initDOM()
      const $selected = $select.querySelector('.keselect__selected')
      const $search = $select.querySelector('.keselect__search')
      const $messageWrapper = $select.querySelector('.keselect__message-wrapper')
      const $message = $select.querySelector('.keselect__message')
      const $dropdown = $select.querySelector('.keselect__dropdown')

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.input($search, {
        target: {
          value: 'French'
        }
      })

      expect($messageWrapper).toHaveClass('keselect__message-wrapper--show')
      expect($message).toHaveTextContent('No data available')
    })

    it('should open the dropdown and close by pressing esc key', () => {
      const $select = initDOM()
      const $selected = $select.querySelector('.keselect__selected')
      const $dropdown = $select.querySelector('.keselect__dropdown')

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.keyUp(document, { keyCode: 27 })

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
    })

    it('should open the dropdown and close by clicking outside', () => {
      const $select = initDOM()
      const $selected = $select.querySelector('.keselect__selected')
      const $dropdown = $select.querySelector('.keselect__dropdown')

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.click(document)

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
    })
  })
})
