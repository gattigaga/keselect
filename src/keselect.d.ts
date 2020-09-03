type Item = {
  /** Index of the option item (it starts from 0). */
  index: number;

  /** Label of the option item. */
  label: string;

  /** Value of the option item. */
  value: string;
};

type SetItemsCallback = (items: Item[]) => void;
type OnChangeCallback = (value: string) => void;

type Options = {
  /** Toggle enable/disable select functionality. */
  isDisabled: boolean;

  /** Used to set options from Ajax result. */
  onSearch: (keyword: string, setItems: SetItemsCallback) => void;

  /** Callback that called after dropdown opened. */
  onDropdownOpen: () => void;

  /** Callback that called after dropdown closed. */
  onDropdownClose: () => void;
};

class Keselect {
  /**
   * Create keselect instance.
   *
   * @param $origin Raw select element.
   * @param options Used as configuration.
   */
  constructor($origin: HTMLSelectElement, options: Options);

  /**
   * Set new value but can be used only if "onSearch" callback is not defined.
   *
   * @param value New value.
   */
  setValue(value: string): void;

  /**
   * Get keselect's value.
   *
   * @returns Keselect value.
   */
  getValue(): string;

  /**
   * Destroy keselect's instance.
   */
  destroy(): void;

  /**
   * An event listener that listen to everytime user change the value by clicking an option item.
   *
   * @param callback Called when user change the value.
   */
  onChange(callback: OnChangeCallback): void;
};

export default Keselect;
