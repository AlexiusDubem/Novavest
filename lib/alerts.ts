'use client'

import Swal, { type SweetAlertIcon } from 'sweetalert2'

function isDarkMode() {
  if (typeof document === 'undefined') return true
  return document.documentElement.classList.contains('dark')
}

function baseOptions() {
  const dark = isDarkMode()

  return {
    background: dark ? '#101817' : '#ffffff',
    color: dark ? '#f5fbf8' : '#091224',
    confirmButtonColor: '#2147a6',
    cancelButtonColor: dark ? '#22312d' : '#d9e2ef',
    customClass: {
      popup: 'rounded-[28px]',
      confirmButton: 'rounded-full px-6 py-3',
      cancelButton: 'rounded-full px-6 py-3',
    },
  }
}

export function fireAlert(options: {
  title: string
  text?: string
  html?: string
  icon?: SweetAlertIcon
  showCancelButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonColor?: string
  preConfirm?: () => any
}) {
  return Swal.fire({
    ...baseOptions(),
    icon: options.icon ?? 'success',
    title: options.title,
    text: options.text,
    html: options.html,
    showCancelButton: options.showCancelButton,
    confirmButtonText: options.confirmButtonText,
    cancelButtonText: options.cancelButtonText,
    confirmButtonColor: options.confirmButtonColor ?? baseOptions().confirmButtonColor,
    preConfirm: options.preConfirm,
  })
}

export const showValidationMessage = (message: string) => Swal.showValidationMessage(message)

