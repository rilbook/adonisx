const MainRepository = require(`${src}/Repositories/MainRepository`)

const getDependencies = () => {
  return JSON.parse(JSON.stringify({
    validation: {},
    route: {},
    routeHelper: {},
    trigger: {},
    repositoryHelper: {}
  }))
}

const getInstance = (dep) => {
  return new MainRepository(
    dep.validation,
    dep.route,
    dep.routeHelper,
    dep.trigger,
    dep.repositoryHelper
  )
}

const getRequest = () => {
  return JSON.parse(JSON.stringify({
    apix: {
      url: 'api/users/1/posts',
      parent_column: 'userId'
    }
  }))
}

const getQuery = () => {
  const query = {}
  query.paginate = jest.fn(() => {
    return 'PaginationResult'
  })
  return query
}

test('MainRepository should be able to paginate by route definition.', async () => {
  // Model mock
  const query = getQuery()
  const UserPost = {}
  UserPost.query = jest.fn(() => {
    return query
  })

  // Request mock
  const request = getRequest()

  // Constructer mocks
  const dep = getDependencies()
  dep.repositoryHelper.getModelPath = jest.fn(() => {
    return 'App/Models/UserPost'
  })
  dep.repositoryHelper.getModel = jest.fn(() => {
    return UserPost
  })
  dep.repositoryHelper.addParentIdCondition = jest.fn(() => {})
  dep.trigger.fire = jest.fn(() => {})

  const repository = getInstance(dep)
  const result = await repository.paginate(request, { userId: 1 })

  expect(dep.repositoryHelper.getModelPath.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModelPath.mock.calls[0][0]).toBe('api/users/1/posts')

  expect(dep.repositoryHelper.getModel.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModel.mock.calls[0][0]).toBe('App/Models/UserPost')

  expect(dep.repositoryHelper.addParentIdCondition.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][0]).toBe(query)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][1].userId).toBe(1)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][2]).toBe('userId')

  expect(dep.trigger.fire.mock.calls.length).toBe(2)
  expect(dep.trigger.fire.mock.calls[0][0]).toBe('onBefore')
  expect(dep.trigger.fire.mock.calls[0][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[0][2]).toBe('paginate')
  expect(dep.trigger.fire.mock.calls[0][3].query).toBe(query)

  expect(dep.trigger.fire.mock.calls[1][0]).toBe('onAfter')
  expect(dep.trigger.fire.mock.calls[1][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[1][2]).toBe('paginate')
  expect(dep.trigger.fire.mock.calls[1][3].result).toBe('PaginationResult')

  expect(query.paginate.mock.calls.length).toBe(1)
  expect(query.paginate.mock.calls[0][0]).toBe(1)
  expect(query.paginate.mock.calls[0][1]).toBe(10)

  expect(result).toBe('PaginationResult')
})