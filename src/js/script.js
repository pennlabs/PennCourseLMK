$(document).ready(function(){
  var depts = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: ['AAMW', 'ACCT', 'AFAM', 'AFRC', 'AFST', 'ALAN', 'AMCS', 'AMES', 'ANCH', 
              'ANCS', 'ANEL', 'ANTH', 'ARAB', 'ARCH', 'ARTH', 'ASAM', 'ASTR', 'BCHE', 
              'BE', 'BENF', 'BENG', 'BEPP', 'BFLW', 'BFMD', 'BIBB', 'BIOE', 'BIOH', 
              'BIOL', 'BIOT', 'BMB', 'BPUB', 'BRYN', 'BSTA', 'CAMB', 'CBE', 'CHE', 'CHEM', 
              'CHIN', 'CINE', 'CIS', 'CIT', 'CLST', 'COGS', 'COLL', 'COML', 'COMM', 'CPLN', 
              'CRIM', 'CSE', 'DEMG', 'DTCH', 'DYNM', 'EALC', 'EAS', 'ECON', 'EDUC', 'EE', 'EEUR', 
              'ENGL', 'ENGR', 'ENM', 'ENVS', 'ESE', 'FILM', 'FNAR', 'FNCE', 'FOLK', 'FREN', 
              'FRSM', 'GAFL', 'GCB', 'GENH', 'GEOL', 'GLAW', 'GMED', 'GREK', 'GRMN', 'GSOC', 
              'GSWS', 'GUJR', 'HCMG', 'HEBR', 'HIND', 'HIST', 'HPR', 'HSOC', 'HSPV', 'HSSC', 
              'IMUN', 'INSC', 'INSR', 'INTG', 'INTR', 'INTS', 'IPD', 'ITAL', 'JPAN', 'JWST', 
              'KORN', 'LALS', 'LARP', 'LATN', 'LAW', 'LGIC', 'LGST', 'LING', 'LSMP', 'LTAM', 
              'MATH', 'MCS', 'MEAM', 'MED', 'MGEC', 'MGMT', 'MKSE', 'MKTG', 'MLA', 'MLYM', 
              'MMP', 'MSE', 'MSSP', 'MUSA', 'MUSC', 'NANO', 'NELC', 'NETS', 'NGG', 'NPLD', 
              'NURS', 'OIDD', 'OPIM', 'PERS', 'PHIL', 'PHRM', 'PHYS', 'PPE', 'PRTG', 'PSCI', 
              'PSSA', 'PSYC', 'PSYS', 'PUBH', 'PUNJ', 'REAL', 'RELS', 'ROML', 'RUSS', 'SARS', 
              'SAST', 'SCND', 'SKRT', 'SLAV', 'SOCI', 'SPAN', 'STAT', 'STSC', 'SWRK', 'SYS', 
              'TAML', 'TCOM', 'TELU', 'THAR', 'TRAN', 'TURK', 'URBS', 'URDU', 'VCSN', 'VIPR', 
              'VLST', 'WH', 'WHCP', 'WHMP', 'WRIT', 'WSTD', 'YDSH']
    });

  $('#bloodhound .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'states',
    source: depts
  });
});