import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { Neomorph } from 'react-native-neomorph-shadows';
///const { width } = Dimensions.get('window');
import { get, post } from '../../class/ApiManager.js';


export const AutoCompleteDropDown = ({
    url,
    onSelectItemL,
    onClear,
    icon,
    onChangeSelect,
    placeholderTextColor = null,
    options = [],
    showSearch = true,
    divideWidthBy = 1.09,
    //height = 55,
    selectedValue = null,
    placeholderColor,
    widthRatio = 0.8,
    borderColor = '#B1C5D5',
    backgroundColor = 'white',
    borderWidth = 0.5,
    darkShadowColor = '#9eb5c7',
    lightShadowColor = null,
    shadowOffset = { width: 0, height: 0 },
    initialValue = null,
    onChangeInput,
    inputColor = 'black',
    onPressAddManualAddress,
    theme
}) => {
    const [loading, setLoading] = useState(false);
    const [suggestionsList, setSuggestionsList] = useState(initialValue ?
        [{
            id: 1,
            title: initialValue,
            dropDown: initialValue
        }]
        : null
    );

    const { height, width, scale, fontScale } = useWindowDimensions();

    const [manualAddInput, setManualAddInput] = useState(false);

    const [selectedItem, setSelectedItem] = useState({ title: null });
    const [initialItem, setInitialItem] = useState({ id: 1, title: initialValue, dropDown: initialValue });
    const [searchText, setSearchText] = useState('');

    const [show, setIsShow] = useState(true);
    const [isInitiate, setIsInitiate] = useState(false);
    const [finaldWidth, setFinalWidth] = useState(Math.floor(width * widthRatio));

    const dropdownController = useRef(null);

    var prevSearchLenght = 0;

    var searchRef = useRef(null);

    var getSuggestions = useCallback(q => {
        onChangeInput(q)

        setSearchText(q)
        console.log('getSuggestions', q);
        var filterToken = q.toLowerCase();
        if (typeof q !== 'string' || q.length < 0) {
            setSuggestionsList(null);
            return;
        }
        var currentSearchLength = q.length
        if (prevSearchLenght > currentSearchLength) {
            console.log("Deleter Detected" + q);
            // setSearchText(filterToken);
            // setSuggestionsList(null);
            // dropdownController.current.AutoCompleteDropDown

            //setSearchText('')
        }

        prevSearchLenght = currentSearchLength;

        //Find address api start
        setLoading(true);
        let addressSearchApi = url;
        let body = {
            address: filterToken,
        }

        post(addressSearchApi, body).then(response => {
            try {

                var a = JSON.stringify(response);
                var json = JSON.parse(a);

                console.log('getSuggestions', q);

                console.log('request body: ' + JSON.stringify(body))

                console.log('auto complete resp', JSON.stringify(json));
                const items = json.data;
                var count = 0;
                const suggestions = items
                    // .filter(item => item.address.address.toLowerCase().includes(filterToken))
                    .map((item, index) => (
                        {
                            id: index,
                            title: item.address.address + '',
                            dropDown: item.address.address + ', ' + item.address.city + ', ' +
                                item.address.prov + ', ' + item.address.pc + ', ' + item.address.country,
                            house_road: item.address.address,
                            address: item.address.city + ', ' +
                                item.address.prov + ', ' + item.address.pc + ', ' + item.address.country,
                            obj: item.address,
                        }

                    ));
                setSuggestionsList(suggestions);
                setLoading(false);

            } catch (error) {
                console.log("Auto complete json parse error: " + error);
                setLoading(false);
            }
        }).catch(error => {
            console.log("Auto complete api error got: " + error)

            setManualAddInput(true);
            // console.log('auto complete resp error ==>', JSON.stringify(json));
            setSuggestionsList(null);
            //const title = "Please update address"
            //const msg = json.message;
            setLoading(false);
        })
    }, []);

    const handle_initial = (value) => {
        setInitialItem({ id: 1, title: value, dropDown: value });

        setSuggestionsList({
            id: 1,
            title: value,
            dropDown: value
        })
    };

    useEffect(() => {

        //setInitialItem({ id: 1, title: initialValue, dropDown: initialValue });

        // setSuggestionsList({
        //   id: 1,
        //   title: initialValue,
        //   dropDown: initialValue
        // })

        //handle_initial(initialValue);

        //handle_initial(initialItem)
        console.log('Search Text' + searchText);
        console.log('Initial Value' + initialValue);
        console.log("Initial Item: " + JSON.stringify(initialItem))
    }, [initialValue])


    useEffect(() => {
        console.log('Height: ' + height + " Width: " + width)

        if (Platform.OS === 'android') {
            if (isInitiate) {
                setIsShow(false)
                setTimeout(() => setIsShow(true), 10);
            }
            setIsInitiate(true);
        }

        //setFinalWidth(Math.floor(width ));
        setFinalWidth(Math.floor(width * widthRatio));
    }, [width, height])

    const onClearPress = useCallback(() => {
        setSuggestionsList(null);
    }, []);

    const onOpenSuggestionsList = useCallback(isOpened => { }, []);

    return (
        <View style={{ flexDirection: 'column' }}>
            {show && (
                <View>
                    <Neomorph
                        inner // <- enable inner shadow
                        useArt // <- set this prop to use non-native shadow on ios
                        //swapShadows
                        darkShadowColor={darkShadowColor} //"#B1C5D5" //"#FF3333" // <- set this
                        // darkShadowColor="#9eb5c7" //"#B1C5D5" //"#FF3333" // <- set this
                        lightShadowColor={lightShadowColor} // <- this
                        // lightShadowColor="#B1C5D5" // <- this
                        style={{
                            ...styles.containerBg,
                            width: finaldWidth, /// divideWidthBy,
                            height: 55,

                            borderColor: borderColor,
                            backgroundColor: backgroundColor,
                            borderWidth: borderWidth,
                            shadowOffset: shadowOffset,
                        }}>
                        <View
                            style={[
                                { flex: 1, flexDirection: 'row', alignItems: 'center' },
                                Platform.select({ ios: { zIndex: 1 } }),
                            ]}>
                            <AutocompleteDropdown
                                initialValue={initialItem}//{{ id: 1, title: initialValue, dropDown: initialValue }}
                                ref={searchRef}
                                //useFilter={false}
                                matchFrom={'start'}//'any' |
                                // emptyResultText={''}
                                // EmptyResultComponent={null}

                                closeOnBlur={(suggestionsList && suggestionsList.length > 0) ? false : true}
                                //direction="down"
                                //direction={Platform.select({ios: 'down'})}
                                controller={controller => {
                                    dropdownController.current = controller;
                                }}
                                dataSet={suggestionsList}
                                onChangeText={value => {
                                    console.log('Text Chage: ' + value)
                                    getSuggestions(value)
                                }}
                                onSelectItem={item => {
                                    console.log("On Select Item" + JSON.stringify(item));

                                    if (item) {
                                        setSelectedItem(item);
                                        onSelectItemL(item);
                                    }
                                    //setSuggestionsList(null);
                                }}
                                onFocus={item => {
                                    //console.log("On focus: "+ JSON.stringify(item[0]) );


                                    onChangeInput('')
                                    onClearPress()

                                    setSuggestionsList([]);



                                    onClear(true);

                                }}
                                clearOnFocus={false}
                                debounce={1000}
                                direction={'down'}//Platform.select({ ios: 'down' })}
                                suggestionsListMaxHeight={Dimensions.get('window').height * 0.3}
                                onClear={() => {
                                    setSearchText('')

                                    onClearPress()
                                    onClear();
                                    setSuggestionsList([]);

                                }}
                                onSubmit={e => console.log('Submit' + e.nativeEvent.text)} //Submit
                                onOpenSuggestionsList={onOpenSuggestionsList}
                                loading={loading}
                                useFilter={false} // prevent rerender twice
                                textInputProps={{
                                    placeholder: 'Address', //'Search address',
                                    placeholderTextColor: placeholderColor,
                                    autoCorrect: false,
                                    cursorColor: borderColor,
                                    height: 50,
                                    blurOnSubmit: true,
                                    //autoFocus: true,
                                    autoComplete: 'true',
                                    importantForAutofill: 'no',// 'no',

                                    autoCapitalize: 'none',
                                    style: {
                                        borderRadius: 25,
                                        color: inputColor,
                                        paddingLeft: 18,
                                        textAlign: 'center',
                                        fontSize: 14,
                                    },
                                }}

                                rightButtonsContainerStyle={{ height: 50, paddingRight: 3, alignSelf: 'center' }}
                                inputContainerStyle={{
                                    alignSelf: 'center',
                                    //borderRadius: 50,
                                    backgroundColor: 'transparent',
                                    height: 50,
                                    //borderWidth: 0.5,
                                    //borderColor: '#fff',
                                }}
                                suggestionsListContainerStyle={{
                                    borderRadius: 20,
                                    backgroundColor: 'gray',
                                }}
                                containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                                renderItem={(item, text) => {
                                    return (
                                        <Text style={{
                                            color: inputColor,
                                            padding: 15,

                                            fontFamily: theme?.font.body.fontFamily,
                                            fontWeight: theme?.font.body.fontWeight,
                                            fontSize: theme?.font.fontSize.s,
                                        }}>
                                            {item.dropDown}  {/*({text}) - {item.title} */}
                                        </Text>
                                    );
                                }}
                                inputHeight={50}
                                showChevron={false}
                                showClear={((searchText && searchText.length > 0) || (initialValue && initialValue?.length > 0)) ? true : false}
                            />
                        </View>
                    </Neomorph>
                    <View>
                        {manualAddInput && !suggestionsList &&
                            <TouchableOpacity
                                onPress={onPressAddManualAddress}>
                                <View style={styles.listContainer}>
                                    <Text style={{
                                        fontFamily: theme?.font.body.fontFamily,
                                        fontWeight: theme?.font.body.fontWeight,
                                        fontSize: theme?.font.fontSize.s,
                                    }}>Addess not found, add manually</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            )}
        </View>
    );
};



const styles = StyleSheet.create({
    //TODO need to fix rotation screen also
    container: {
        //backgroundColor: 'white',
        padding: 0,
    },
    listContainer: {

        marginTop: 5,
        padding: 10,
        alignItems: 'center',
        //position: 'absolute',
        backgroundColor: 'gray',
        width: '100%',
        borderRadius: 20,
        zIndex: 100,
        shadowColor: '#00000099',
        shadowOffset: {
            width: 0,
            height: 12
        },
    },
    containerBg: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowColor: 'white',
        shadowRadius: 5,
        borderRadius: 50, //20,
        backgroundColor: 'white',
        borderColor: '#B1C5D5',
        alignContent: 'center',
        paddingRight: 1,
        justifyContent: 'center',
        // width: width / divideWidthBy,
        // height: 55,
    },
    itemTextStyle: { color: 'black', fontSize: 12 }, //Need to add theme color
    dropdown: {
        // height: 55,
        marginTop: 0,
        marginBottom: 0,
        borderColor: '#d7d7d7',
        borderWidth: 0,
        borderRadius: 50, //20,
        paddingHorizontal: 10,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 12,
        color: 'gray',
    },
    placeholderStyle: {
        fontSize: 12,
        color: 'gray',
    },
    selectedTextStyle: {
        fontSize: 12,
        //color: 'gray',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 12, //16,
        borderRadius: 32,
        color: 'gray',
    },
});

