import { <%= classify(name) %>Component } from './<%= dasherize(name) %>.component';<% if (moduleName) { %>
import { <%= classify(moduleName) %>Module } from '<%= dasherize(relativePath) %>.module';<% } %>
import { Shallow } from 'shallow-render/dist';

describe('<%= classify(name) %>Component', () => {
    let shallow: Shallow<<%= classify(name) %>Component>;

    beforeEach(() => {
        shallow = new Shallow(<%= classify(name) %>Component, <%= classify(moduleName) %>Module);
    });

    it('should create', async () => {
        const { get } = await shallow.render('<<%= dasherize(name) %>></<%= dasherize(name) %>>');
        expect(get('p')).toHaveFound(1);
    });
});
