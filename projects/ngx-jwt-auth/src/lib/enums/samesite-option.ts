/**
 * Enum of cookie samesite security level types.
 */
export enum ESamesiteOption {
  /**
   * Cookies will only be sent in a first-party context
   * and not be sent along with requests initiated by third party websites.
   */
  strict = 'strict',
  /**
   * Cookies are not sent on normal cross-site subrequests.
   */
  lax = 'lax',
}
