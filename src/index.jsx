/** @jsx createElement */

import {createElement, Phrase} from 'lacona-phrase'
import Freetext from 'lacona-phrase-freetext'
import open from 'open'
import request from 'request'
import SearchInternet from 'LaconaCommand-SearchInternet'

class GoogleSuggest extends Phrase {
  static get initialState() {return {inputs: {}}}

  suggest(input) {
    if (input.length > 0 && !this.state.inputs[input]) {
      const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${input}`
      request(url, (err, res, body) => {
        if (err) return
        const data = JSON.parse(body)
        if (data && data[1]) {
          this.setState({inputs: {[input]: data[1]}})
        }
      })
    }

    const suggestions = this.state.inputs[input]
    if (suggestions) {
      return suggestions.map(s => ({text: s, value: s}))
    }
    return []
  }

  describe() {
    return <value compute={this.suggest.bind(this)} />
  }
}

class GoogleSearch extends Phrase {
  static get overrides() {return [SearchInternet.sentences[0]]}

  execute(result) {
    const url = `https://www.google.com/search?q=${result.query}`
    open(url)
  }

  describe() {
    return (
      <sequence>
        <literal text='search ' category='action' />
        <literal text='Google' category='actor' />
        <literal text=' for ' category='conjunction' join={true} />
        <choice category='argument' id='query'>
          <Freetext>
            <literal text='Lacona' value='Lacona' />
          </Freetext>
          <GoogleSuggest />
        </choice>
      </sequence>
    )
  }
}

export default {
  sentences: [],
  extensions: [GoogleSearch],
  config: {}
}
