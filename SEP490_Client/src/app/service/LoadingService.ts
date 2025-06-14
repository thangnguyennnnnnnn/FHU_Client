export class LoadingService {
    Start() {
        console.log("Loading");
        var loading = document.getElementById("loadingGroup");
        if(loading) {
            loading.style.display = "flex";
        }
        
    }

    async Stop() {
        var loading = document.getElementById("loadingGroup");
        if(loading) {
            await this.delay(1000, loading);
        }
    }

    async delay(ms: number, loading: HTMLElement) {
        await new Promise<void>(resolve => setTimeout(()=> {resolve()}, ms)).then(()=>{loading.style.display = "none";console.log("Load Done")});
    }
}