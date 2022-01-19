const { filterSpecsFromCoverage } = require('../../support-utils')

describe('minimatch', () => {
  it('string matches', () => {
    expect(
      Cypress.minimatch('/user/app/src/codeA.js', '/user/app/src/codeA.js'),
      'matches full strings'
    ).to.be.true

    expect(
      Cypress.minimatch('/user/app/src/codeA.js', 'codeA.js'),
      'does not match just the end'
    ).to.be.false

    expect(
      Cypress.minimatch('/user/app/src/codeA.js', '**/codeA.js'),
      'matches using **'
    ).to.be.true
  })
})

describe('filtering specs', () => {
  describe('using integrationFolder in Cypress < v10', () => {
    let config
    let env
    let spec

    beforeEach(() => {
      config = cy.stub()
      config.withArgs('integrationFolder').returns('src')

      env = cy.stub().returns({})

      spec = {
        absolute: '/user/app/cypress/integration/test.cy.js',
        relative: 'cypress/integration/test.cy.js'
      }
    })

    it('filters list of specs by single string', () => {
      config.withArgs('testFiles').returns('specA.js')
      const totalCoverage = {
        '/user/app/cypress/integration/specA.js': {},
        '/user/app/cypress/integration/specB.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/cypress/integration/specB.js': {}
      })
    })

    it('filters list of specs by single string in array', () => {
      config.withArgs('testFiles').returns(['codeA.js'])
      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs by pattern', () => {
      config.withArgs('testFiles').returns(['**/*B.js'])

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {}
      })
    })

    it('filters list of specs by pattern and single spec', () => {
      config.withArgs('testFiles').returns(['**/*B.js', 'codeA.js'])

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result, 'all specs have been filtered out').to.deep.equal({})
    })

    it('filters list of specs in integration folder', () => {
      config.withArgs('testFiles').returns('**/*.*') // default pattern

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {},
        // these files should be removed
        '/user/app/cypress/integration/spec1.js': {},
        '/user/app/cypress/integration/spec2.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs when testFiles specifies folder', () => {
      config.withArgs('testFiles').returns(['cypress/integration/**.*'])

      const totalCoverage = {
        '/user/app/cypress/integration/specA.js': {},
        '/user/app/cypress/integration/specB.js': {},
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        'src/my-code.js': {}
      })
    })
  })

  describe('using codeCoverageExclude in Cypress >= v10', () => {
    let config
    let env
    let spec

    beforeEach(() => {
      config = cy.stub()

      env = cy.stub().returns({
        //filter out all files in the cypress folder
        codeCoverageExclude: 'cypress/**/*.*'
      })

      spec = {
        absolute: '/user/app/cypress/integration/test.cy.js',
        relative: 'cypress/integration/test.cy.js'
      }
    })

    it('filters list of specs by single string', () => {
      config.withArgs('specPattern').returns('specA.cy.js')
      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/specB.cy.js': {}
      })
    })

    it('filters list of specs by single string in array', () => {
      config.withArgs('specPattern').returns(['specA.cy.js'])
      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/specB.cy.js': {}
      })
    })

    it('filters out file in codeCoverageExclude', () => {
      config.withArgs('specPattern').returns(['**/*.cy.js'])
      const totalCoverage = {
        '/user/app/cypress/support/index.js': {},
        '/user/app/cypress/commands/index.js': {},
        //these files should be included
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs by pattern', () => {
      config.withArgs('specPattern').returns(['**/*B.js'])

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {}
      })
    })

    it('filters list of specs by pattern and single spec', () => {
      config.withArgs('specPattern').returns(['**/*B.js', 'codeA.js'])

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result, 'all specs have been filtered out').to.deep.equal({})
    })

    it('filters list of specs in integration folder', () => {
      config.withArgs('specPattern').returns('**/*.cy.{js,jsx,ts,tsx}') // default pattern

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {},
        // these files should be removed
        '/user/app/cypress/integration/spec1.js': {},
        '/user/app/cypress/integration/spec2.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs when specPattern specifies folder', () => {
      config.withArgs('specPattern').returns(['src/**/*.cy.js'])

      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {},
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterSpecsFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        'src/my-code.js': {}
      })
    })
  })
})
