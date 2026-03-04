const React = require('react');

const hubspot = {
  extend: jest.fn((callback) => callback)
};

const Text = ({ children }) => React.createElement('span', { 'data-testid': 'hs-text' }, children);
const Button = ({ children, onClick }) => React.createElement('button', { onClick }, children);
const Flex = ({ children, direction }) => React.createElement('div', { 'data-testid': 'hs-flex', 'data-direction': direction }, children);
const Divider = () => React.createElement('hr', { 'data-testid': 'hs-divider' });
const Alert = ({ children, title, type }) => React.createElement('div', { 'data-testid': 'hs-alert', 'data-type': type, 'data-title': title }, children || title);
const ProgressBar = ({ value }) => React.createElement('div', { 'data-testid': 'hs-progress-bar', 'data-value': value });

module.exports = {
  hubspot,
  Text,
  Button,
  Flex,
  Divider,
  Alert,
  ProgressBar
};
