const dim = {
    in(time) {
        document.querySelector('#dim').addEventListener('click', this.handler);
        if(time) {
            document.querySelector('#dim').style.cssText = 'pointer-events:auto;opacity:1;transition:opacity '+ time +'s;';
        }else {
            document.querySelector('#dim').style.cssText = 'pointer-events:auto;opacity:1;transition:opacity 0s;';
        }
    },
    out(time) {
        document.querySelector('#dim').removeEventListener('click', this.handler);
        if(time) {
            document.querySelector('#dim').style.cssText = 'pointer-events:none;opacity:0;transition:opacity '+ time +'s;';
        }else {
            document.querySelector('#dim').style.cssText = 'pointer-events:none;opacity:0;transition:opacity 0s;';
        }
    },
    handler() {
        if(MODAL == true) {
            modal.out();
        }
    }
};

let MODAL = false;
const modal = {
    in(a) {
        MODAL = true;
        let target = document.querySelector('#modal');
        for(let i of target.children) {
            if(i.getAttribute('data-modal-name') == a) {
                i.style.display = 'block';
            }
        }
        dim.in();
    },
    out() {
        MODAL = false;
        let target = document.querySelector('#modal');
        for(let i of target.children) {
            i.style.display = 'none';
        }
        dim.out();
    }
};