import { writable } from 'svelte/store';

export const currentFocus = writable(undefined);

export const activeTask = writable(undefined);



const generateEmptyGrid = () => {
    let grid = [];
    for(let i = 0; i < 81; i++) {
        grid.push({index: i, value: /*Math.floor(Math.random() * 9) + 1*/undefined});
    }
    return grid;
}

export let sudoku = writable(generateEmptyGrid());

export const setValue = (index, value) => {
    sudoku.update(currentGrid => {
        currentGrid = [...currentGrid.slice(0, index), {index, value}, ...currentGrid.slice(index + 1)];
        return currentGrid;
    });
}