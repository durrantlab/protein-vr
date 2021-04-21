// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

let showBackdrop = true;
let resolveFunc;
let skinnyModal = false;

export interface IOpenModal {
    title: string;
    content: string;
    hasCloseBtn?: boolean;
    unclosable?: boolean;
    showBackdrop?: boolean;
    skinny?: boolean;
    btnText?: string;
    onCloseCallback?: any;
    onReadyCallBack?: any
}

/**
 * Opens the modal.
 * @param  {IOpenModal} params  The parameters required to open this modal.
 * @returns Promise  A promise that is fulfilled when done.
 */
export function openModal(params: IOpenModal): Promise<any> {
    showBackdrop = params.showBackdrop;
    skinnyModal = params.skinny;

    // Load the css if needed.
    return new Promise((resolve, reject) => {
        resolveFunc = resolve;
        resolveFunc();
    });
}
