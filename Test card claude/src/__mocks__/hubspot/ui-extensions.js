// Mock for @hubspot/ui-extensions SDK
// Used in Jest tests — replaces the real SDK with lightweight stubs

const React = require('react');

// Default hubspot mock with extend() stub
const hubspot = {
  extend: jest.fn((callback) => callback),
};

// ---- V1 Core UI Stubs ----

const Text = ({ children }) => React.createElement('span', { 'data-testid': 'text' }, children);

const Button = ({ children, onClick, variant, size, disabled, 'aria-label': ariaLabel }) =>
  React.createElement('button', { onClick, 'data-variant': variant, 'data-size': size, disabled, 'aria-label': ariaLabel }, children);

const Divider = () => React.createElement('hr', { 'data-testid': 'divider' });

const Alert = ({ children, variant }) =>
  React.createElement('div', { role: 'alert', 'data-variant': variant }, children);

const CrmActionButton = ({ children, actionType, actionContext, 'aria-label': ariaLabel }) =>
  React.createElement('button', { 'data-action-type': actionType, 'aria-label': ariaLabel }, children);

const Flex = ({ children, direction, gap, justify, align }) =>
  React.createElement('div', { 'data-direction': direction, 'data-gap': gap, 'data-justify': justify, 'data-align': align }, children);

const LoadingSpinner = ({ label, size }) =>
  React.createElement('div', { 'data-testid': 'loading-spinner', 'aria-label': label, 'data-size': size });

// ---- V2 Input Stubs ----

const Input = ({ label, name, value, placeholder, onInput }) =>
  React.createElement('input', {
    'aria-label': label,
    name,
    defaultValue: value,
    placeholder,
    onChange: (e) => onInput && onInput(e.target.value),
    'data-testid': `input-${name}`,
  });

const Select = ({ label, name, value, options, onChange }) =>
  React.createElement('select', {
    'aria-label': label,
    name,
    defaultValue: value,
    onChange: (e) => onChange && onChange(e.target.value),
    'data-testid': `select-${name}`,
  }, (options || []).map((opt) =>
    React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
  ));

const NumberInput = ({ label, name, value, onChange }) =>
  React.createElement('input', {
    type: 'number',
    'aria-label': label,
    name,
    defaultValue: value,
    onChange: (e) => onChange && onChange(Number(e.target.value)),
    'data-testid': `number-input-${name}`,
  });

const DateInput = ({ label, name, value, onChange }) =>
  React.createElement('input', {
    type: 'date',
    'aria-label': label,
    name,
    defaultValue: value,
    onChange: (e) => onChange && onChange(e.target.value),
    'data-testid': `date-input-${name}`,
  });

const ToggleGroup = ({ label, name, options, value, onChange }) =>
  React.createElement('div', { 'aria-label': label, 'data-testid': `toggle-${name}` },
    (options || []).map((opt) =>
      React.createElement('button', {
        key: opt.value,
        'data-selected': value === opt.value,
        onClick: () => onChange && onChange(opt.value),
      }, opt.label)
    )
  );

const UserAssociationPicker = ({ label, name, placeholder, onChange }) =>
  React.createElement('select', {
    'aria-label': label,
    name,
    'data-testid': `owner-picker-${name}`,
    onChange: (e) => onChange && onChange(e.target.value),
  });

const CheckboxGroup = ({ label, name, options, onChange }) =>
  React.createElement('div', { 'aria-label': label, 'data-testid': `checkbox-group-${name}` },
    (options || []).map((opt) =>
      React.createElement('input', {
        key: opt.value,
        type: 'checkbox',
        defaultChecked: opt.checked,
        value: opt.value,
        onChange: (e) => {
          if (onChange) {
            const checkedValues = (options || [])
              .filter((o) => o.value === opt.value ? e.target.checked : o.checked)
              .map((o) => o.value);
            onChange(checkedValues);
          }
        },
        'aria-label': opt.label,
        'data-testid': `checkbox-${opt.value}`,
      })
    )
  );

// ---- V2 Modal Stubs ----

const Modal = ({ children, id, open, onClose }) =>
  open ? React.createElement('div', { role: 'dialog', 'data-testid': id, id }, children) : null;

const ModalHeader = ({ children }) =>
  React.createElement('div', { 'data-testid': 'modal-header' }, children);

const ModalBody = ({ children }) =>
  React.createElement('div', { 'data-testid': 'modal-body' }, children);

const ModalFooter = ({ children }) =>
  React.createElement('div', { 'data-testid': 'modal-footer' }, children);

// ---- ProgressBar ----

const ProgressBar = ({ value }) =>
  React.createElement('div', { 'data-testid': 'hs-progress-bar', 'data-value': String(value) });

// ---- Tag (used in the original card) ----

const Tag = ({ children, variant }) =>
  React.createElement('span', { 'data-testid': 'tag', 'data-variant': variant }, children);

module.exports = {
  default: hubspot,
  hubspot,
  Text,
  Button,
  Divider,
  Alert,
  CrmActionButton,
  Flex,
  LoadingSpinner,
  ProgressBar,
  Input,
  Select,
  NumberInput,
  DateInput,
  ToggleGroup,
  UserAssociationPicker,
  CheckboxGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tag,
};
