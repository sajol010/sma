import { useEffect, useRef, useState } from "react";

export default function useDynamicSVGImport(name, options = {}) {
    const ImportedIconRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();

    const { onCompleted, onError } = options;
    useEffect(async () => {
        console.log("Import name==>", name)
        // let abc = `../../assets/${name}.svg`
        // // const req = require.context("components", true, /\.stories\.tsx$/);
        // // const req = require.context('../../assets/rightArrow.svg', true, /\.stories\.js$/);
        // const req = require.context(
        //     '../../assets/rightArrow.svg',
        //     (useSubdirectories = true),
        //     // (regExp = /^\.\/.*$/),
        //     (mode = 'sync')
        //   );

        // console.log("req==>", req)
        // console.log("path==>", abc)

        // const AdsenseComponent = dynamic(() => import(abc));

        // import RightArrow from '../../assets/rightArrow.svg';
        // const icon = require(`../../assets/account_icon.svg`);
        // let icon = (await import (abc));
        // console.log("icon==>", icon)

        setLoading(true);
        const importIcon = async () => {
            try {
                // ImportedIconRef.current = (await import(abc)).ReactComponent;
                ImportedIconRef.current = (await import (`../../assets/${name}.svg`));
                // ImportedIconRef.current = (await import(`../assets/icons/${name}.svg`)).ReactComponent;
                // const { default: namedImport } = await import(`../assets/icons/${name}.svg`);
                // ImportedIconRef.current = namedImport;
                if (onCompleted) {
                    onCompleted(name, ImportedIconRef.current);
                }
            } catch (err) {
                if (onError) {
                    onError(err);
                }
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        importIcon();
    }, [name, onCompleted, onError]);

    return { error, loading, SvgIcon: ImportedIconRef.current };
}