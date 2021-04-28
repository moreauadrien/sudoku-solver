class Hint {
    private index:number;
    private value:number;
    private hint:string;

    constructor(index:number, value:number, hint:string) {
        this.index = index;
        this.value = value;
        this.hint = hint;
    }

    public getIndex(): number {
        return this.index;
    }

    public getValue(): number {
        return this.value;
    }

    public getHint(): string {
        return this.hint;
    }
    
}

export default Hint;