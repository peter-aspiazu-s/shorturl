console.log('estoy aquí, si existo soy el frontend');

document.addEventListener('click', e => {
    if(e.target.dataset.short){
        const url = `${window.location.origin}/${e.target.dataset.short}`;

        navigator.clipboard.writeText(url)
            .then(() => {
                console.log("text copied to clipboard")
            })
            .catch((err) => {
                console.log("something went wrong", err)
            })
    }
});