import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { ArrowRight, Construction } from '@carbon/icons-react';
import ReactTextTransition, { presets } from "react-text-transition";
import ErrorBoundary from '@docusaurus/ErrorBoundary';


type position = [number | "t" | "u" | "c", number?];
type dimension = [number, number] | number;

// interface colorElement{
//     origin: position;
//     color: string | string[];
//     type: "single" | "array" | "area" | "area-array";

//     pos: position | position[] | [position, dimension] | [position, dimension][]; // For single and array

//     // By default, the position in uiElement is used, unless specified here as the new origin
//     // For single, only color is needed - This is the default!
//     // For array, single color and array of pos is needed
//     // For area, single color and size is needed
//     // For area-array, size is needed and color is an array of colors, colors element can be undefined!
//   }
interface uiDisplayElement {
    pos: position;
    size?: dimension;
    color?: string | string[];
}

interface uiElement
{
    // Functions
    name?: string; // If no name, only color will be displayed
    desc?: string;
    link?: string;
    elements: uiDisplayElement[];
}

interface UIProps {
  uiName: string;
  uiDescription: string;
  uiElements: uiElement[];
}

const MystrixVisualizer: React.FC<UIProps> = ({ uiName, uiDescription, uiElements }) => {
    const [selected_function, setSelectedFunction] = useState<number | undefined>(undefined);
    const [selected_function_locked, setSelectedFunctionLocked] = useState<boolean>(false);

    const [keypadColors, setKeypadColors] = useState<(string | undefined)[]>(Array(64).fill(undefined));
    const [keypadFunctions, setKeypadFunctions] = useState<(number | undefined)[]>(Array(64).fill(undefined));
    const [underglowColors, setUnderglowColors] = useState<(string | undefined)[]>(Array(32).fill(undefined));
    const [touchbarFunctions, setTouchbarFunctions] = useState<(number | undefined)[]>(Array(32).fill(undefined));
    const [centerKeyFunctions, setCenterKeyFunctions] = useState<(number | undefined)>(undefined);
    const [detailButtonColor, setDetailButtonColor] = useState<string>("unset");


    const getKeyID = (x: number, y: number) => x + y * 8;

    const constructor = () => {
        const tempKeypadColors: (string | undefined)[] = Array(64).fill(undefined);
        const tempKeypadFunctions: (number | undefined)[] = Array(64).fill(undefined);
        const tempUnderglowColors: (string | undefined)[] = Array(32).fill(undefined);
        const tempTouchbarFunctions: (number | undefined)[] = Array(32).fill(undefined);
        let tempCenterKeyFunction: (number | undefined) = undefined;

        uiElements.forEach((element, index) => {
            if(element.elements === undefined) return;

            // if(!Array.isArray(element.elements)) {
            // {
            //     element.elements = [element.elements as uiDisplayElement];
            // }

            element.elements?.forEach((displayElement) => {
                    if (displayElement.pos[0] == "t") {
                        if (!displayElement.size) displayElement.size = 1;
                        for (let i = 0; i < (displayElement.size as number); i++) {
                            tempTouchbarFunctions[displayElement.pos[1] + i] = index;
                        }
                    } else if (displayElement.pos[0] == "u" && displayElement.color !== undefined) {
                        if (!displayElement.size) displayElement.size = 1;

                        if (Array.isArray(displayElement.size)) { return; }

                        if (typeof displayElement.color === "string" || displayElement.color === undefined) {
                            for (let i = 0; i < (displayElement.size as number); i++) {
                                tempUnderglowColors[displayElement.pos[1] + i] = displayElement.color;
                            }
                        }
                        else if(Array.isArray(displayElement.color) && displayElement.color.length === displayElement.size)
                        {
                            for (let i = 0; i < (displayElement.size as number); i++) {
                                tempUnderglowColors[displayElement.pos[1] + i] = displayElement.color[i];
                            }
                        }
                    } else if (displayElement.pos[0] == "c") {
                        tempCenterKeyFunction = index;
                    } else {
                        if (!displayElement.size) displayElement.size = [1, 1];

                        if (!Array.isArray(displayElement.size)) { return; }
                        
                        if (Array.isArray(displayElement.color) && displayElement.color.length !== displayElement.size[0] * displayElement.size[1]) { return; }

                        for (let x = 0; x < displayElement.size[0]; x++) {
                            for (let y = 0; y < displayElement.size[1]; y++) {
                                const keyID = getKeyID(displayElement.pos[0] as number + x, displayElement.pos[1] + y);
                                tempKeypadFunctions[keyID] = index;
                                if (typeof displayElement.color === "string" || displayElement.color === undefined) {
                                    tempKeypadColors[keyID] = displayElement.color;
                                }
                                else if(Array.isArray(displayElement.color))
                                {
                                    tempKeypadColors[keyID] = displayElement.color[y * displayElement.size[0] + x];
                                }
                            }
                        }
                    }
                });
            });

        setKeypadColors(tempKeypadColors);
        setKeypadFunctions(tempKeypadFunctions);
        setUnderglowColors(tempUnderglowColors);
        setTouchbarFunctions(tempTouchbarFunctions);
        setCenterKeyFunctions(tempCenterKeyFunction);
    };

  const getCornerRadius = (x: number, y: number) => {
    switch (x + y * 10) {
      case 43:
        return "polygon(60% -20%, 120% 40%, 120% 120%, -20% 120%, -20% -20%)";
      case 44:
        return "polygon(40% -20%, 120% -20%, 120% 120%, -20% 120%, -20% 40%)";
      case 33:
        return "polygon(120% -20%, 120% 60%, 60% 120%, -20% 120%, -20% -20%)";
      case 34:
        return "polygon(120% -20%, 120% 120%, 40% 120%, -20% 60%, -20% -20%)";
      default:
        return "unset";
    }
  };

  const selectHighlightFunction = (function_id: number, color : string = "rgb(60, 60, 60)") => {
    if (selected_function_locked == false && function_id != undefined) 
    {
        setSelectedFunction(function_id);
        console.log("Select Function ID: " + function_id);
        if (uiElements[function_id].link != undefined) {
            setDetailButtonColor(color);
        }
    }
    else if (selected_function_locked == false && function_id == undefined) 
    {
        setSelectedFunction(undefined);
    }
  }

  const lockSelectedFunction = (function_id: number, color : string = "rgb(60, 60, 60)") => {
    console.log("Lock Function ID: " + function_id);
    if (selected_function_locked == true && selected_function == function_id) {
        setSelectedFunctionLocked(false);
        setSelectedFunction(undefined);
    }
    else if (uiElements[function_id] != undefined && uiElements[function_id].name != undefined) {
        setSelectedFunctionLocked(true);
        setSelectedFunction(function_id);
        if (uiElements[function_id].link != undefined) {
            setDetailButtonColor(color);
        }
    }
    else
    {
        setSelectedFunctionLocked(false);
        setSelectedFunction(undefined);
    }
  }

    useEffect(() => {
        constructor();
    }, [uiElements]);

  return (
    <ErrorBoundary
        fallback={({error, tryAgain}) => (
        <div>
            <p>The Mystrix Visualizer crashed because of error: {error.message}.</p>
            <button onClick={tryAgain}>Try Again!</button>
        </div>
        )}>
        <div className={styles.MystrixVisualizer} onClick={() => {lockSelectedFunction(undefined)}}>
            
            <div className={styles.mystrix}>
            <div className={`${styles.mystrixUnderglow} ${selected_function != undefined ? styles.mystrixUnderglowDim : ''}`}>
                <div className={styles.mystrixUnderglowRow}>
                {Array.from({ length: 8 }, (_, x) => {
                    let keyColor = underglowColors?.[x + 24];
                        return ( <div key={x} className={styles.mystrixUnderglowLed} style={{backgroundColor: keyColor ? keyColor : "rgba(0, 0, 0, 0)"}}/>)
                })}
                </div>

                <div style={{ display: "flex", flexDirection: "row", height: "88%", justifyContent: "space-between" }}>
                <div className={styles.mystrixUnderglowColumn}>
                    {Array.from({ length: 8 }, (_, y) => {
                    let keyColor = underglowColors?.[y + 16];
                        return ( <div key={y} className={styles.mystrixUnderglowLed} style={{backgroundColor: keyColor ? keyColor : "rgba(0, 0, 0, 0)"}}/>)
                    })}
                </div>

                <div className={styles.mystrixUnderglowColumn}>
                    {Array.from({ length: 8 }, (_, y) => {
                        let keyColor = underglowColors?.[y];
                        return ( <div key={y} className={styles.mystrixUnderglowLed} style={{backgroundColor: keyColor ? keyColor : "rgba(0, 0, 0, 0)"}}/>)
                    })}
                </div>
                </div>

                <div className={styles.mystrixUnderglowRow}>
                {Array.from({ length: 8 }, (_, x) => {
                    let keyColor = underglowColors?.[15 - x];
                    return ( <div key={x} className={styles.mystrixUnderglowLed} style={{backgroundColor: keyColor ? keyColor : "rgba(0, 0, 0, 0)"}}/>)
                })}
                </div>
            </div>

            <div className={styles.mystrixBorder} onMouseLeave={() => {selectHighlightFunction(undefined)}}>
                <div className={styles.mystrixControls}>
                {Array.from({ length: 8 }, (_, y) => (
                    <div key={y} className={styles.mystrixControlsRow}>
                    {Array.from({ length: 8 }, (_, x) => {
                        let keyColor = keypadColors?.[y * 8 + x]; // Declare keyColor here
                        let dim = selected_function != undefined && selected_function !== keypadFunctions[y * 8 + x];
                        let selected = selected_function != undefined && selected_function === keypadFunctions[y * 8 + x];

                        return ( // Return the JSX from the arrow function
                            <div 
                                key={x} 
                                className={`
                                    ${styles.mystrixBtn} 
                                    ${keyColor ? styles.mystrixBtnLit : ''} 
                                    ${dim ? styles.mystrixBtnDim : ''} 
                                    ${selected ? styles.mystrixBtnSelected : ''}`}
                                style={{ 
                                    clipPath: getCornerRadius(x, y), 
                                    backgroundColor: keyColor ? keyColor : "rgb(160, 160, 160)", // Corrected closing parenthesis
                                    boxShadow: (keyColor && ! dim) ? `0 0 5px 1px ${keyColor}` : "none", // Corrected closing parenthesis
                                    }}
                                onMouseEnter={(e) => { selectHighlightFunction(keypadFunctions[y * 8 + x], keyColor);}}
                                onClick={(e) => { lockSelectedFunction(keypadFunctions[y * 8 + x], keyColor);  e.stopPropagation()}}
                                // i would try to make it so that when you hover over a key it selects the thing so that you can go to details page faster instead of wondeing why it disappears (just a qol thing)
                                //or alternatively make it so that button presses have more feedback so that you know you pressed it cause you kinda don't see it rn

                                //TODO: Fix a bug where you can click on a touchbar and select top row of the grid (seen in device settings)
                                />
                        );
                    })}
                    </div>
                ))}
                </div>
            </div>

            <div className={styles.mystrixTouchKey}>
                <div className={styles.mystrixTouchKeyRow}>
                {Array.from({ length: 8 }, (_, x) => (
                    <div key={x} className={styles.mystrixTouchkeyBtn}>
                        <div   
                            className={`
                            ${styles.mystrixTouchkeyBtnChild} 
                            ${(touchbarFunctions[24 + x] != undefined) ? styles.mystrixTouchkeyBtnChildHasElement : ''}
                            ${(selected_function != undefined && selected_function !== touchbarFunctions[24 + x]) ? styles.mystrixTouchkeyBtnChildDim : ''}
                            ${(selected_function != undefined && selected_function === touchbarFunctions[24 + x]) ? styles.mystrixTouchkeyBtnChildSelected : ''}`}
                            onMouseEnter={() => {selectHighlightFunction(touchbarFunctions[24 + x])}}
                            onClick={(e) => {lockSelectedFunction(keypadFunctions[24 + x]), e.stopPropagation()}}
                        />
                    </div>
                ))}
                </div>

                <div style={{ display: "flex", flexDirection: "row", height: "94%", justifyContent: "space-between" }}>
                <div className={styles.mystrixTouchKeyColumn}>
                    {Array.from({ length: 8 }, (_, y) => (
                    <div key={y} className={styles.mystrixTouchkeyBtn}>
                        <div 
                            className={`
                            ${styles.mystrixTouchkeyBtnChild} 
                            ${(touchbarFunctions[16 + y] != undefined) ? styles.mystrixTouchkeyBtnChildHasElement : ''}
                            ${(selected_function != undefined && selected_function !== touchbarFunctions[16 + y]) ? styles.mystrixTouchkeyBtnChildDim : ''}
                            ${(selected_function != undefined && selected_function === touchbarFunctions[16 + y]) ? styles.mystrixTouchkeyBtnChildSelected : ''}`}
                            onMouseEnter={() => {selectHighlightFunction(touchbarFunctions[16 + y])}}
                            onClick={(e) => {lockSelectedFunction(keypadFunctions[16 + y]), e.stopPropagation()}}
                        />
                    </div>
                    ))}
                </div>

                <div className={styles.mystrixTouchKeyColumn}>
                    {Array.from({ length: 8 }, (_, y) => (
                    <div key={y} className={styles.mystrixTouchkeyBtn}>
                        <div 
                            className={`
                            ${styles.mystrixTouchkeyBtnChild} 
                            ${(touchbarFunctions[y] != undefined) ? styles.mystrixTouchkeyBtnChildHasElement : ''}
                            ${(selected_function != undefined && selected_function !== touchbarFunctions[y]) ? styles.mystrixTouchkeyBtnChildDim : ''}
                            ${(selected_function != undefined && selected_function === touchbarFunctions[y]) ? styles.mystrixTouchkeyBtnChildSelected : ''}`}
                            onMouseEnter={() => {selectHighlightFunction(touchbarFunctions[y])}}
                            onClick={(e) => {lockSelectedFunction(keypadFunctions[y]), e.stopPropagation()}}
                        />
                    </div>
                    ))}
                </div>
                </div>

                <div className={styles.mystrixTouchKeyRow}>
                {Array.from({ length: 8 }, (_, x) => (
                    <div key={x} className={styles.mystrixTouchkeyBtn}>
                            <div 
                            className={`
                            ${styles.mystrixTouchkeyBtnChild} 
                            ${(touchbarFunctions[15 - x] != undefined) ? styles.mystrixTouchkeyBtnChildHasElement : ''}
                            ${(selected_function != undefined && selected_function !== touchbarFunctions[15 - x]) ? styles.mystrixTouchkeyBtnChildDim : ''}
                            ${(selected_function != undefined && selected_function === touchbarFunctions[15 - x]) ? styles.mystrixTouchkeyBtnChildSelected : ''}`}
                            onMouseEnter={() => {selectHighlightFunction(touchbarFunctions[15 - x])}}
                            onClick={(e) => {lockSelectedFunction(keypadFunctions[15 - x]), e.stopPropagation()}}
                        />
                    </div>
                ))}
                </div>
            </div>
            
            <div 
                className={`
                    ${styles.mystrixCenterKey} 
                    ${(centerKeyFunctions != undefined) ? styles.mystrixCenterKeyHasElement : ''}
                    ${(selected_function != undefined && selected_function !== centerKeyFunctions) ? styles.mystrixCenterKeyDim : ''}
                    ${(selected_function != undefined && selected_function === centerKeyFunctions) ? styles.mystrixCenterKeySelected : ''}
                `}
                onMouseEnter={() => {selectHighlightFunction(centerKeyFunctions)}}
                onClick={(e) => {lockSelectedFunction(centerKeyFunctions), e.stopPropagation()}}
            />

            </div>
            <div className={styles.functionDisplay}>
                <div className={styles.functionDisplayContent}>
                    <h2 className={styles.functionName} style={{ position: "absolute"}}>
                        <ReactTextTransition delay={0} direction='up'>
                            {selected_function !== undefined && uiElements[selected_function].name !== undefined ? uiElements[selected_function].name : uiName}
                        </ReactTextTransition>
                    </h2>
                    <h2 className={styles.functionName} style={{opacity: "0%"}}>
                            {selected_function !== undefined && uiElements[selected_function].name !== undefined ? uiElements[selected_function].name : uiName}
                    </h2>
                    <div className={styles.functionDesc}>
                        {/* <ReactTextTransition delay={150} direction='up'> */}
                            {selected_function !== undefined && uiElements[selected_function].name !== undefined ? (uiElements[selected_function].desc !== undefined ? uiElements[selected_function].desc : "") : uiDescription}
                        {/* </ReactTextTransition> */}
                    </div>
                </div>
                <button
                    className={`${styles.functionDetailBtn} ${(selected_function !== undefined && uiElements[selected_function].link !== undefined) ?  '' : styles.functionDetailBtnHidden}`}
                    style={{ 
                        backgroundColor: detailButtonColor
                    }}
                    onClick={() => {
                        if (selected_function !== undefined && uiElements[selected_function].link !== undefined)
                        {
                            if(uiElements[selected_function].link.startsWith("#"))
                            {
                                window.location.hash = "";
                                window.location.hash = uiElements[selected_function].link;
                            }
                            else
                            {
                                window.open(uiElements[selected_function].link, "_self");
                            }
                        }
                    }}
                >   
                    <div className={styles.functionDetailBtnContent} style={{color: detailButtonColor}}>
                        <div className={styles.functionDetailBtnText}>DETAILS</div>
                        <ArrowRight size={28} className={styles.functionDetailBtnArrow}/>
                    </div>
                </button>
            </div>
        </div>
    </ErrorBoundary>
  );
};

export default MystrixVisualizer;
