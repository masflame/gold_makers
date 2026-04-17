import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, placeholder = 'Select...', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusIdx, setFocusIdx] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);

  const getVal = (o) => (typeof o === 'string' ? o : o.value);
  const getLabel = (o) => (typeof o === 'string' ? o : o.label);

  const selected = options.find((o) => getVal(o) === value);
  const selectedLabel = selected ? getLabel(selected) : '';
  const showSearch = options.length > 8;

  const filteredOptions = options.filter((o) =>
    getLabel(o).toLowerCase().includes(search.toLowerCase())
  );

  /* Close on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Focus search input when opened */
  useEffect(() => {
    if (open && inputRef.current && showSearch) {
      inputRef.current.focus();
    }
  }, [open, showSearch]);

  /* Scroll focused/active item into view */
  useEffect(() => {
    if (!open || !listRef.current) return;
    const selector = focusIdx >= 0
      ? `.csel-option[data-idx="${focusIdx}"]`
      : '.csel-option.active';
    const el = listRef.current.querySelector(selector);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [open, focusIdx, value]);

  /* Reset focus index when search changes */
  useEffect(() => { setFocusIdx(-1); }, [search]);

  const handleSelect = useCallback((val) => {
    onChange(val);
    setOpen(false);
    setSearch('');
    setFocusIdx(-1);
    triggerRef.current?.focus();
  }, [onChange]);

  /* Keyboard navigation */
  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusIdx >= 0 && filteredOptions[focusIdx]) {
          handleSelect(getVal(filteredOptions[focusIdx]));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setSearch('');
        setFocusIdx(-1);
        triggerRef.current?.focus();
        break;
      default:
        break;
    }
  }, [open, focusIdx, filteredOptions, handleSelect]);

  return (
    <div
      className={`csel${open ? ' open' : ''}${disabled ? ' disabled' : ''}`}
      ref={ref}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="csel-trigger"
        onClick={() => { if (!disabled) { setOpen(!open); setFocusIdx(-1); } }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`csel-value${!value ? ' placeholder' : ''}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown size={15} className="csel-arrow" />
      </button>

      {open && (
        <div className="csel-dropdown">
          {showSearch && (
            <div className="csel-search">
              <Search size={14} className="csel-search-icon" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="csel-search-input"
              />
            </div>
          )}
          <ul className="csel-list" ref={listRef} role="listbox">
            {filteredOptions.length === 0 && (
              <li className="csel-empty">No results</li>
            )}
            {filteredOptions.map((o, idx) => {
              const val = getVal(o);
              const label = getLabel(o);
              const isActive = val === value;
              const isFocused = idx === focusIdx;
              return (
                <li
                  key={val}
                  data-idx={idx}
                  className={`csel-option${isActive ? ' active' : ''}${isFocused ? ' focused' : ''}`}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(val)}
                  onMouseEnter={() => setFocusIdx(idx)}
                >
                  <span className="csel-option-label">{label}</span>
                  {isActive && <Check size={14} className="csel-check" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
