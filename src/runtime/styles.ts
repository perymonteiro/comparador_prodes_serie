import { css } from 'jimu-core'

export const widgetStyles = css`
  &.widget-comparador-prodes-serie {
    width: 100%;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 8px;
  }
  .comparador-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }
  .comparador-field-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .comparador-hint {
    font-size: 11px;
    color: #6b6b6b;
    line-height: 1.35;
  }
  .comparador-error {
    font-size: 14px;
    color: #b00020;
  }
  .comparador-error--block {
    font-size: 14px;
  }
  .comparador-actions {
    display: flex;
    justify-content: flex-end;
  }
  .comparador-btn-limpar {
    border-radius: 9999px !important;
    padding-left: 20px;
    padding-right: 20px;
  }
  .serie-table-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .serie-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    min-height: 28px;
  }
  .serie-toolbar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.15s ease, opacity 0.15s ease;
  }
  .serie-toolbar-btn--copy {
    border-radius: 6px;
    background: transparent;
    padding: 2px;
  }
  .serie-toolbar-btn--copy:hover {
    opacity: 0.8;
  }
  .serie-toolbar-btn--excel {
    background: transparent;
    padding: 2px;
  }
  .serie-toolbar-btn--excel:hover {
    opacity: 0.8;
  }
  .serie-toolbar-btn:focus-visible {
    outline: 2px solid var(--sys-color-primary-main, #007ac3);
    outline-offset: 2px;
  }
  .serie-toolbar-icon {
    width: 14px;
    height: 14px;
    display: block;
  }
  .serie-toolbar-icon--excel {
    width: 18px;
    height: 18px;
    object-fit: contain;
    display: block;
  }
  .serie-toolbar-icon--copy {
    width: 18px;
    height: 18px;
    object-fit: contain;
    display: block;
  }
  .serie-toolbar-feedback {
    font-size: 11px;
    color: #6b6b6b;
    line-height: 1;
    margin-right: 2px;
  }
  .serie-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }
  .serie-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    min-width: max-content;
  }
  .serie-table th,
  .serie-table td {
    border: 1px solid var(--ref-palette-neutral-300, #d4d4d4);
    padding: 8px 10px;
    vertical-align: middle;
  }
  .serie-table-label {
    text-align: left;
    font-weight: 600;
    background: var(--ref-palette-neutral-100, #f3f3f3);
    white-space: normal;
    min-width: 120px;
    max-width: 180px;
  }
  .serie-table-year,
  .serie-table-value {
    text-align: center;
    white-space: nowrap;
  }
  .serie-table-value--empty {
    background: var(--ref-palette-neutral-50, #fafafa);
  }
  .serie-variation--positive {
    color: #b00020;
    font-weight: 600;
  }
  .serie-variation--negative {
    color: #1b7a3d;
    font-weight: 600;
  }
  .serie-variation--neutral {
    color: inherit;
  }
`
