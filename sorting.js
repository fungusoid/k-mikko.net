// Sorting Algorithms Visualization
const stage = document.getElementById('stage');
const speed = document.getElementById('speed');
const speedLabel = document.getElementById('speedLabel');
const statusEl = document.getElementById('status');
const shuffleBtn = document.getElementById('shuffle');
const stepCountEl = document.getElementById('stepCount');
let array = [], steps = 0;

function randArray(n){
    const a=Array.from({length:n},(_,i)=>i+1);
    for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
}

function renderBars(a, hi={}){
    stage.innerHTML='';
    const w=stage.clientWidth,h=stage.clientHeight,barW=Math.max(2,Math.floor(w/a.length)-1),max=Math.max(...a);
    a.forEach((val,idx)=>{
        const div=document.createElement('div');
        div.className='bar';
        if (hi.swap && (hi.swap[0]===idx || hi.swap[1]===idx)) div.classList.add('swap');
        else if (hi.i===idx || hi.j===idx) div.classList.add('active');
        if (hi.sorted && idx>=hi.sorted.lo && idx<=hi.sorted.hi) div.classList.add('sorted');
        div.style.width=barW+'px';
        div.style.height=Math.max(2,(val/max)*h)+'px';
        div.style.marginRight='1px';
        stage.appendChild(div);
    });
}

function* quickSortSteps(a){
    function medianOfThree(lo, hi){
        const mid=Math.floor((lo+hi)/2);
        const vals=[lo,mid,hi];
        vals.sort((x,y)=>a[x]-a[y]);
        return vals[1];
    }
    function* qs(lo, hi){
        if(lo>=hi) return;
        const origPivotIdx=medianOfThree(lo,hi);
        [a[origPivotIdx],a[hi]]=[a[hi],a[origPivotIdx]];
        yield {arr:a.slice(), hi:{swap:[origPivotIdx,hi]}};
        const pivot=a[hi];
        let i=lo;
        for(let j=lo;j<hi;j++){
            yield {arr:a.slice(), hi:{i:j}};
            if(a[j]<=pivot){
                [a[i],a[j]]=[a[j],a[i]];
                yield {arr:a.slice(), hi:{swap:[i,j]}};
                i++;
            }
        }
        [a[i],a[hi]]=[a[hi],a[i]];
        yield {arr:a.slice(), hi:{swap:[i,hi],sorted:{lo:i,hi:i}}};
        yield* qs(lo,i-1);
        yield* qs(i+1,hi);
    }
    yield* qs(0,a.length-1);
    yield {arr:a.slice(), hi:{sorted:{lo:0,hi:a.length-1}}};
}

function* insertionSortSteps(a){
    for(let i=1;i<a.length;i++){
        let key=a[i],j=i-1;
        yield {arr:a.slice(), hi:{i,j}};
        while(j>=0&&a[j]>key){
            a[j+1]=a[j];
            j--;
            yield {arr:a.slice(), hi:{i:j,j:j+1}};
        }
        a[j+1]=key;
        yield {arr:a.slice(), hi:{i:j+1}};
    }
    yield {arr:a.slice(), hi:{sorted:{lo:0,hi:a.length-1}}};
}

function* mergeSortSteps(a){
    function* ms(lo,hi){
        if(lo>=hi)return;
        const mid=Math.floor((lo+hi)/2);
        yield* ms(lo,mid);
        yield* ms(mid+1,hi);
        const merged=[];
        let i=lo,j=mid+1;
        while(i<=mid&&j<=hi){
            yield {arr:a.slice(), hi:{i,j}};
            if(a[i]<=a[j])merged.push(a[i++]);
            else merged.push(a[j++]);
        }
        while(i<=mid)merged.push(a[i++]);
        while(j<=hi)merged.push(a[j++]);
        for(let t=0;t<merged.length;t++){
            a[lo+t]=merged[t];
            yield {arr:a.slice(), hi:{sorted:{lo:lo,hi:lo+t}}};
        }
    }
    yield* ms(0,a.length-1);
    yield {arr:a.slice(), hi:{sorted:{lo:0,hi:a.length-1}}};
}

function* bucketSortSteps(a){
    if(a.length===0){yield {arr:a.slice(), hi:{}}; return;}
    // assume non-negative integers
    const maxVal = Math.max(...a);
    const counts = Array(maxVal+1).fill(0);
    // Count frequency
    for(let i=0;i<a.length;i++){
        counts[a[i]]++;
        yield {arr:a.slice(), hi:{i}};
    }
    // Write back in order
    let idx=0;
    for(let v=0; v<counts.length; v++){
        for(let c=0;c<counts[v];c++){
            a[idx]=v;
            yield {arr:a.slice(), hi:{i:idx}};
            idx++;
        }
    }
    yield {arr:a.slice(), hi:{sorted:{lo:0, hi:a.length-1}}};
}

let gen;
function play(){
    steps=0;
    stepCountEl.textContent=steps;
    gen=chooseGen(array.slice());
    statusEl.textContent='Running';
    (function step(){
        const r=gen.next();
        if(!r.done){
            steps++;
            stepCountEl.textContent=steps;
            renderBars(r.value.arr,r.value.hi);
            setTimeout(step,parseInt(speed.value,10)||60);
        }else{
            statusEl.textContent='Done ('+steps+' steps)';
        }
    })();
}

function chooseGen(arr){
    const algo = document.getElementById('algo').value;
    if (algo === 'insertion') return insertionSortSteps(arr);
    if (algo === 'quick') return quickSortSteps(arr);
    if (algo === 'merge') return mergeSortSteps(arr);
    if (algo === 'bucket') return bucketSortSteps(arr);
    return insertionSortSteps(arr);
}

function shuffle(){
    array=randArray(40);
    steps=0;
    stepCountEl.textContent=steps;
    renderBars(array);
    statusEl.textContent='Shuffled';
}

shuffle();
document.getElementById('play').onclick=play;
shuffleBtn.onclick=shuffle;
speed.oninput=()=>{speedLabel.textContent=speed.value+'ms';};
speed.dispatchEvent(new Event('input'));
window.addEventListener('resize',()=>renderBars(array));
