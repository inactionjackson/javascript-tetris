function create2dArray(rows,columns,defaultValue){
    return  new Array(rows).fill(defaultValue).map(() => new Array(columns).fill(defaultValue))
 }
 function rotate2dArray90(arrayToRotate) {
     let newArray = create2dArray(arrayToRotate[0].length,arrayToRotate.length,0);
     
     for (let i = 0; i < arrayToRotate.length; i++) {
         for (let k = 0; k < arrayToRotate[i].length; k++) {
             newArray[k][i] = arrayToRotate[i][k];
         }
     }
 
     return newArray;
 }
 function mirror2dArray(arrayToMirror, axis) {
     let newArray = create2dArray(arrayToMirror.length,arrayToMirror[0].length,0);
 
     for (let i = 0; i < arrayToMirror.length; i++) {
         for (let k = 0; k < arrayToMirror[i].length; k++) {
             if (axis === "y") {
                 newArray[i][k] = arrayToMirror[arrayToMirror.length - 1 - i][k];
             } else if (axis === "x") {
                 newArray[i][k] = arrayToMirror[i][arrayToMirror[i].length - 1 - k];
             }
         }
     }
 
     return newArray;
 }