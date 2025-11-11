declare module 'photoswipe/lightbox' {
  export interface PhotoSwipeLightboxOptions {
    gallery: string | Element | Element[] | NodeListOf<Element>
    children?: string
    pswpModule: () => Promise<unknown>
    [key: string]: unknown
  }

  export default class PhotoSwipeLightbox {
    constructor(options: PhotoSwipeLightboxOptions)
    init(): void
    destroy(): void
  }
}

declare module 'photoswipe' {
  export default class PhotoSwipe {}
}

