import useDynamicSVGImport from "./useDynamicSVGImport";

export default function Icon({ name, onCompleted, onError, ...rest }) {
    console.log("Icon name==>", name)

	const { error, loading, SvgIcon } = useDynamicSVGImport(name, { onCompleted, onError });
	if (error) {
		return error.message;
	}
	if (loading) {
		return "Loading...";
	}
	if (SvgIcon) {
		return <SvgIcon {...rest} />;
	}
	return null;
}
