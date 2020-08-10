import './styles.css'

const createBaseElement = (items, $origin) => {
  const selectedIndex = $origin.selectedIndex
  const defaultItem = items[selectedIndex]
  const isPlaceholderSelected = defaultItem.value === ''

  // Create container to wrap and hide original select element
  const $container = document.createElement('div')
  $container.classList.add('keselect')
  $origin.parentNode.insertBefore($container, $origin)
  $container.appendChild($origin)

  // Create selected element that contains selected option or placeholder
  const $selected = document.createElement('p')
  $selected.classList.add('keselect__selected')
  $selected.textContent = defaultItem.label

  if (isPlaceholderSelected) {
    $selected.classList.add('keselect__selected--placeholder')
  }

  $container.appendChild($selected)

  // Create dropdown element
  const $dropdown = document.createElement('div')
  $dropdown.classList.add('keselect__dropdown', 'keselect__dropdown--hide')
  $container.appendChild($dropdown)

  // Create searchbox to find options by keyword
  const $searchWrapper = document.createElement('div')
  $searchWrapper.classList.add('keselect__search-wrapper')
  $dropdown.appendChild($searchWrapper)

  const $search = document.createElement('input')
  $search.classList.add('keselect__search')
  $searchWrapper.appendChild($search)

  // Create option wrapper element that contains option list
  const $optionWrapper = document.createElement('div')
  $optionWrapper.classList.add('keselect__option-wrapper')
  $dropdown.appendChild($optionWrapper)

  return {
    $container,
    $selected,
    $dropdown,
    $search,
    $optionWrapper
  }
}

const createOptionsElement = (items, $optionWrapper) => {
  items.forEach(item => {
    const $option = document.createElement('div')
    $option.classList.add('keselect__option')
    $option.dataset.label = item.label
    $option.dataset.value = item.value
    $optionWrapper.appendChild($option)

    const $label = document.createElement('p')
    $label.textContent = item.label
    $option.appendChild($label)
  })
}

const keselect = ($origin) => {
  let selectedIndex = $origin.selectedIndex
  let isOpen = false

  // Get options data from inside original select element
  const items = Object.values($origin.options).map($option => ({
    label: $option.label,
    value: $option.value
  }))

  const {
    $container,
    $selected,
    $dropdown,
    $search,
    $optionWrapper
  } = createBaseElement(items, $origin)

  createOptionsElement(items, $optionWrapper)

  const $options = $optionWrapper.querySelectorAll('.keselect__option')

  // Make container able to toggle open/close when clicked
  $container.addEventListener('click', () => {
    if (isOpen) {
      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')

      $search.value = ''

      const $options = $optionWrapper.querySelectorAll('.keselect__option')

      const newItems = items.filter(item => {
        const keyword = event.target.value
        const pattern = new RegExp(keyword, 'ig')

        return pattern.test(item.label)
      })

      $options.forEach($option => $option.remove())
      createOptionsElement(newItems, $optionWrapper)
    } else {
      $dropdown.classList.remove('keselect__dropdown--hide')
      $dropdown.classList.add('keselect__dropdown--show')
    }

    isOpen = !isOpen
  })

  // Prevent event bubbling when dropdown clicked
  $dropdown.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  $search.addEventListener('keyup', (event) => {
    const $options = $optionWrapper.querySelectorAll('.keselect__option')

    const newItems = items.filter(item => {
      const keyword = event.target.value
      const pattern = new RegExp(keyword, 'ig')

      return pattern.test(item.label)
    })

    $options.forEach($option => $option.remove())
    createOptionsElement(newItems, $optionWrapper)
  })

  $options.forEach(($option, index) => {
    $option.addEventListener('click', () => {
      const { label, value } = $option.dataset
      const isPlaceholderSelected = value === ''

      $selected.classList.remove('keselect__selected--placeholder')
      $options[selectedIndex].classList.remove('keselect__option--selected')
      $option.classList.add('keselect__option--selected')

      if (isPlaceholderSelected) {
        $selected.classList.add('keselect__selected--placeholder')
      }

      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')

      $selected.textContent = label
      $origin.selectedIndex = index
      selectedIndex = index
      isOpen = false
    })
  })
}

export default keselect
