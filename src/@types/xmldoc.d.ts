declare module "xmldoc" {
	class XmlDocument extends XmlElement {
		constructor(xml:String|Buffer);
		doctype: string;
	}
	class XmlElement {
		type: "element";
		name: string;
		attr: Record<string, string>;
		val: string;
		children: XmlElement[];
		firstChild: XmlElement | null;
		lastChild: XmlElement | null;
		line: number;
		column: number;
		position: number;
		startTagPosition: number;
		eachChild(iterator:(child:XmlElement, index:number, array:XmlElement[]) => unknown): void;
		childNamed(name:string): XmlElement;
		childrenNamed(name:string): XmlElement[];
		childWithAttribute(name:string, value?:string): XmlElement;
		descendantWithPath(path:string): XmlElement;
		valueWithPath(path:string): string;
		toString(options?:object): string;
	}
	class XmlTextNode {
		type: "text";
		text: string;
		toString(): string;
		toStringWithIndent(): string;
	}
	class XmlCDataNode {
		type: "cdata";
		cdata: string;
		toString(): string;
		toStringWithIndent(): string;
	}
	class XmlCommentNode {
		type: "comment";
		comment: string;
		toString(): string;
		toStringWithIndent(): string;
	}
}
