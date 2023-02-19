import { Parser } from 'htmlparser2';
import { type ChildNode, DomHandler } from 'domhandler';
import { generateRandomNum, showToast } from '@/tools';
import Constants from '@/constants';
import { existsOne } from 'domutils';

Component({
  options: {
    addGlobalClass: true,
    pureDataPattern: /^_/,
    multipleSlots: false,
  },

  properties: {
    rawHtml: {
      type: String,
      value: '',
    },
  },

  data: {
    nodes: [] as any[],
  },

  lifetimes: {
    attached() {
      const rawHtml = this.data.rawHtml;
      if (!rawHtml) {
        return;
      }

      const parser = new Parser(
        new DomHandler((error, dom) => {
          if (error) {
            console.log(error);
            void showToast({ title: '解析内容发生错误', icon: 'error' });
          } else {
            this.setData({
              nodes: dom.map((item, index) => this.handleDomItem(item, index)),
            });
          }
        })
      );
      parser.write(rawHtml);
      parser.end();
    },
  },

  methods: {
    handleDomItem(item: ChildNode, index: number | string) {
      let templateType = 'rich';
      const id = generateRandomNum(10);
      const _type = item.type;
      const type = item.type === 'text' ? 'text' : 'node';
      // @ts-expect-error name
      const name = item.name ?? 'span';
      // @ts-expect-error data
      const text = item.data;
      // @ts-expect-error attribs
      const attrs = item.attribs ?? {};
      // @ts-expect-error children
      const children = (item.children ?? []).map((value, valueIndex) =>
        this.handleDomItem(value, index + '-' + valueIndex)
      );
      const classs = ((attrs.class ?? '') as string)
        .split(' ')
        .filter((value) => value)
        .map((value) => value.trim());
      const styles = ((attrs.style ?? '') as string)
        .split(';')
        .filter((value) => value)
        .map((value) => value.trim());
      let _class = attrs.class as string | undefined;
      let style = attrs.style as string | undefined;

      const exists = existsOne(
        (elem) => {
          return elem.name === 'a' || elem.name === 'img';
        },
        [item]
      );

      if (exists) {
        if (name === 'a') {
          templateType = 'a';
        } else if (name === 'img') {
          templateType = 'img';
        } else if (Constants.BLOCK_ELEMENTS.includes(name)) {
          templateType = 'view';
        } else if (Constants.INLINE_ELEMENTS.includes(name)) {
          templateType = 'text';
        }
      } else if (
        name === 'figure' &&
        existsOne(
          (elem) => {
            return elem.name === 'table';
          },
          [item]
        )
      ) {
        if (style?.includes('width:')) {
          _class = _class + ' table-auto overflow-auto';
          style = style.replace(/width:.*;?/g, '');
        }
        templateType = 'view';
      }

      // if (!excludedElements.includes(name)) {
      //   if (name === 'a') {
      //     templateType = 'a';
      //   } else if (Constants.BLOCK_ELEMENTS.includes(name)) {
      //     templateType = 'view';
      //   } else if (Constants.INLINE_ELEMENTS.includes(name)) {
      //     templateType = 'text';
      //   }
      // }

      return {
        id,
        _type,
        type,
        templateType,
        name,
        text,
        attrs,
        children,
        classs,
        class: _class,
        styles,
        style,
      };
    },
  },
});
