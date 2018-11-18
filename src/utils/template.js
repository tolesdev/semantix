const BaseTemplate = children => children.map(child => `${child}`).join('');

const SectionTemplate = (header, children) => (
`## ${header}

${children.map(child => `${child}\n`).join('')}`
);

const SubSection = (scope, children) => (
`
### **${scope}**

${children.map(child => `* ${child}\n`).join('')}`
);

const SubSectionNoHeader = children => `${children.map(child => `* ${child}\n`).join('')}`;

class TemplateBuilder {
    constructor() {
        this.baseTemplate = BaseTemplate;
        this.sectionTemplate = SectionTemplate;
        this.subSectionTemplate = SubSection;
        this.subSectionNoHeaderTemplate = SubSectionNoHeader;
        this.composedSections = [];
        this.subSections = [];
        this.openingSection = true;
    }
    Build(title) {
        if (this.subSections.length) {
            this.composedSections.push(this.sectionTemplate(this.header, this.subSections));
        }
        return this.baseTemplate(title, this.composedSections);
    }
    Section(header) {
        if (!this.openingSection) {
            this.composedSections.push(this.sectionTemplate(this.header, this.subSections));
            this.subSections = [];
        }
        this.header = header;
        this.openingSection = false;
        return this;
    }
    SubSection(header, items) {
        this.subSections.push(this.subSectionTemplate(header, items));
        return this;
    }
    SubSectionNoHeader(items) {
        this.subSections.push(this.subSectionNoHeaderTemplate(items));
        return this;
    }
}

module.exports = TemplateBuilder;