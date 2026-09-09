const ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const WIDTHS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'full', label: 'Full width' },
];

export default class ImageLayoutTune {
  static isTune = true;

  constructor({ data }) {
    this.data = {
      alignment: data?.alignment || 'center',
      width: data?.width || 'full',
    };
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-layout-tune';
    wrapper.appendChild(this.createLabel('Alignment'));
    wrapper.appendChild(this.createSelect(ALIGNMENTS, 'alignment'));
    wrapper.appendChild(this.createLabel('Size'));
    wrapper.appendChild(this.createSelect(WIDTHS, 'width'));
    return wrapper;
  }

  createLabel(text) {
    const label = document.createElement('span');
    label.className = 'image-layout-tune__label';
    label.textContent = text;
    return label;
  }

  createSelect(options, property) {
    const select = document.createElement('select');
    select.className = 'image-layout-tune__select';
    select.setAttribute('aria-label', property === 'alignment' ? 'Image alignment' : 'Image size');

    options.forEach((option) => {
      const item = document.createElement('option');
      item.value = option.value;
      item.textContent = option.label;
      item.selected = this.data[property] === option.value;
      select.appendChild(item);
    });

    select.addEventListener('change', () => {
      this.data[property] = select.value;
    });
    return select;
  }

  save() {
    return this.data;
  }
}