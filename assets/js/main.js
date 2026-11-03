/*!
*   Hugo Theme Stack
*
*   @author: Jimmy Cai
*   @website: https://jimmycai.com
*   @link: https://github.com/CaiJimmy/hugo-theme-stack
*/
import menu from './menu.js';
import createElement from './createElement.js';
import StackColorScheme from './colorScheme.js';
import { setupScrollspy } from './scrollspy.js';
import { setupSmoothAnchors } from './smoothAnchors.js';
import { setupPaginationJump } from './pagination.js';
import { setupCodeCopy } from './code-copy.js';
import { setupAnswerToggle } from './answerToggle.js';

let Stack = {
    init: () => {
        /**
         * Bind menu event
         */
        menu();

        const articleContent = document.querySelector('.article-content');
        if (articleContent) {
            setupSmoothAnchors();
            setupScrollspy();
            setupCodeCopy();
        }

        setupPaginationJump();

        setupAnswerToggle();

        new StackColorScheme(document.getElementById('dark-mode-toggle'));
    }
}

window.addEventListener('load', () => {
    setTimeout(function () {
        Stack.init();
    }, 0);
})

window.Stack = Stack;
window.createElement = createElement;
