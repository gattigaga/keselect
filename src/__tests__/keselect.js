
import { getByText, fireEvent, waitFor, getByTestId } from '@testing-library/dom'

import Keselect from '../keselect'

describe('Keselect', () => {
  describe('Non Ajax', () => {
    const initDOM = () => {
      const $container = document.createElement('div')

      $container.innerHTML = `
        <select name="language_id" id="languages" data-testid="keselect">
          <option value="">Select Language</option>
          <option value="1">Bahasa Indonesia</option>
          <option value="2">Arabic</option>
          <option value="3">English</option>
          <option value="4">Japanese</option>
          <option value="5">Chinese</option>
          <option value="6">Russian</option>
        </select>
      `

      return $container
    }

    it('should failed to create keselect instance because element passed was invalid', () => {
      const message = 'Passed element is not a valid HTML element.'
      const keselect = () => new Keselect({})

      expect(keselect).toThrowError(message)
    })

    it('should destroy the instance', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $container } = keselect._elements

      expect($main).toContainElement($container)

      keselect.destroy()

      expect($main).not.toContainElement($container)

      const setValue = () => keselect.setValue(4)
      const getValue = () => keselect.getValue()
      const destroy = () => keselect.destroy()
      const onChange = () => keselect.onChange()
      const message = 'Instance has been destroyed.'

      expect(setValue).toThrowError(message)
      expect(getValue).toThrowError(message)
      expect(destroy).toThrowError(message)
      expect(onChange).toThrowError(message)
    })

    it('should open the dropdown and select an option', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $messageWrapper, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      getByText($dropdown, 'Japanese').click()

      expect($selected).toHaveTextContent('Japanese')
      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect($messageWrapper).toHaveClass('keselect__message-wrapper--hide')
    })

    it('should filter the option list and select an option that found', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $search, $messageWrapper, $dropdown } = keselect._elements

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
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $search, $messageWrapper, $message, $dropdown } = keselect._elements

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

    it('should close the dropdown by pressing esc key', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.keyUp(document, { keyCode: 27 })

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
    })

    it('should close the dropdown by clicking main selected', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.click($selected)

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
    })

    it('should close the dropdown by clicking outside', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.click(document)

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
    })

    it('should not open the dropdown because was disabled', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select, { isDisabled: true })
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect($selected).toHaveClass('keselect__selected--placeholder')
    })

    it('should call callback when dropdown open', () => {
      const onDropdownOpen = jest.fn()
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select, { onDropdownOpen })
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')
      expect(onDropdownOpen).toBeCalled()
    })

    it('should call callback when dropdown closed by pressing esc key', () => {
      const onDropdownClose = jest.fn()
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select, { onDropdownClose })
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.keyUp(document, { keyCode: 27 })

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect(onDropdownClose).toBeCalled()
    })

    it('should call callback when dropdown closed by clicking main selected', () => {
      const onDropdownClose = jest.fn()
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select, { onDropdownClose })
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.click($selected)

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect(onDropdownClose).toBeCalled()
    })

    it('should call callback when dropdown closed by clicking outside', () => {
      const onDropdownClose = jest.fn()
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select, { onDropdownClose })
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      fireEvent.click(document)

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect(onDropdownClose).toBeCalled()
    })

    it('should call callback when dropdown closed by selecting option', () => {
      const onDropdownClose = jest.fn()
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select, { onDropdownClose })
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      getByText($dropdown, 'Japanese').click()

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect(onDropdownClose).toBeCalled()
    })

    it('should set new value', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $dropdown } = keselect._elements

      expect(keselect.getValue()).toBe('')

      keselect.setValue('4')

      const $option = getByText($dropdown, 'Japanese').closest('.keselect__option')

      expect(keselect.getValue()).toBe('4')
      expect($option).toHaveClass('keselect__option--selected')
      expect($selected).toHaveTextContent('Japanese')
      expect($selected).not.toHaveClass('keselect__selected--placeholder')

      keselect.setValue('')

      expect($selected).toHaveClass('keselect__selected--placeholder')
    })

    it('should not set new value because value is not string', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const message = 'Value should use "string" as data type.'

      const setValue = () => keselect.setValue(4)

      expect(setValue).toThrowError(message)
    })

    it('should not set new value because ajax is used', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select, { onSearch: () => {} })
      const message = 'Method "setValue" cannot be used when "onSearch" callback used.'

      const setValue = () => keselect.setValue('4')

      expect(setValue).toThrowError(message)
    })

    it('should not set new value because options was not found', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const message = 'Options was not found.'

      const setValue = () => keselect.setValue('99')

      expect(setValue).toThrowError(message)
    })

    it('should returns the value', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      getByText($dropdown, 'Japanese').click()

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect(keselect.getValue()).toBe('4')
    })

    it('should listen when user change the value via clicking an option item', () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')
      const keselect = new Keselect($select)
      const { $selected, $dropdown } = keselect._elements
      const callback = jest.fn()

      keselect.onChange(callback)

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')

      getByText($dropdown, 'Japanese').click()

      expect($dropdown).toHaveClass('keselect__dropdown--hide')
      expect(callback).toBeCalledWith('4')
    })
  })

  describe('Ajax', () => {
    const items = [
      {
        index: 1,
        label: 'Bahasa Indonesia',
        value: 1
      },
      {
        index: 2,
        label: 'Arabic',
        value: 2
      },
      {
        index: 3,
        label: 'English',
        value: 3
      },
      {
        index: 4,
        label: 'Japanese',
        value: 4
      },
      {
        index: 5,
        label: 'Chinese',
        value: 5
      },
      {
        index: 6,
        label: 'Russian',
        value: 6
      }
    ]

    const initDOM = () => {
      const $container = document.createElement('div')

      $container.innerHTML = `
        <select name="language_id" id="languages" data-testid="keselect">
          <option value="">Select Language</option>
        </select>
      `

      return $container
    }

    it('should open the dropdown, filter and select an option', async () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')

      const keselect = new Keselect($select, {
        onSearch: (keyword, setItems) => {
          const filteredItems = items.filter(item => {
            const pattern = new RegExp(keyword, 'ig')
            const isMatch = pattern.test(item.label)

            return isMatch
          })

          setTimeout(() => {
            setItems(filteredItems)
          }, 1000)
        }
      })

      const { $selected, $search, $messageWrapper, $message, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')
      expect($messageWrapper).toHaveClass('keselect__message-wrapper--show')
      expect($message).toHaveTextContent('Enter a keyword to find options')

      fireEvent.input($search, {
        target: {
          value: 'Jap'
        }
      })

      expect($message).toHaveTextContent('Searching...')

      await waitFor(() => {
        expect($messageWrapper).toHaveClass('keselect__message-wrapper--hide')
      }, {
        container: $select,
        timeout: 2000
      })

      getByText($dropdown, 'Japanese').click()

      expect($selected).toHaveTextContent('Japanese')
      expect($dropdown).toHaveClass('keselect__dropdown--hide')
    })

    it('should filter and not found an option', async () => {
      const $main = initDOM()
      const $select = getByTestId($main, 'keselect')

      const keselect = new Keselect($select, {
        onSearch: (keyword, setItems) => {
          const filteredItems = items.filter(item => {
            const pattern = new RegExp(keyword, 'ig')
            const isMatch = pattern.test(item.label)

            return isMatch
          })

          setTimeout(() => {
            setItems(filteredItems)
          }, 1000)
        }
      })

      const { $selected, $search, $messageWrapper, $message, $dropdown } = keselect._elements

      expect($dropdown).toHaveClass('keselect__dropdown--hide')

      getByText($selected, 'Select Language').click()

      expect($dropdown).toHaveClass('keselect__dropdown--show')
      expect($messageWrapper).toHaveClass('keselect__message-wrapper--show')
      expect($message).toHaveTextContent('Enter a keyword to find options')

      fireEvent.input($search, {
        target: {
          value: 'Fre'
        }
      })

      expect($message).toHaveTextContent('Searching...')

      await waitFor(() => {
        expect($message).toHaveTextContent('No data available')
      }, {
        container: $select,
        timeout: 2000
      })
    })
  })
})
