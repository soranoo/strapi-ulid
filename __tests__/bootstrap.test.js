import { ulid } from "ulid";
import bootstrap from "../server/bootstrap";

const strapi = {
  db: {
    lifecycles: {
      subscribe: jest.fn(),
    },
  },
  contentTypes: {
    'api::firstTestModel': {
      attributes: {
        actualULID: {
          customField: "plugin::field-ulid.ulid",
        },
        baitULID: {},
      },
    },
    'api::secondTestModel': {
      attributes: {
        title: {},
        uid: {},
      },
    },
    'api::thirdTestModel': {
      attributes: {
        actualULID: {
          customField: "plugin::field-ulid.ulid",
        },
      },
    },
  },
};

describe("bootstrap", () => {
  it("should subscribe to lifecycles for models that have ulid fields", () => {
    bootstrap({ strapi });

    expect(strapi.db.lifecycles.subscribe).toHaveBeenCalledTimes(1);
    expect(strapi.db.lifecycles.subscribe).toHaveBeenCalledWith(expect.any(Function));

    const newUlid = ulid();
    const subscribeCallback = strapi.db.lifecycles.subscribe.mock.calls[0][0];
    const event = {
      action: "beforeCreate",
      model: {
        uid: "api::firstTestModel",
      },
      params: {
        data: {
          baitULID: "invalid-ulid",
          actualULID: newUlid,
        },
      },
    };
    subscribeCallback(event);

    expect(event.params.data.baitULID).toBe("invalid-ulid");
    expect(!!event.params.data.actualULID).toBe(true);
    expect(event.params.data.actualULID).toBe(newUlid);
  });

  it("should not subscribe to lifecycles for models that don't have ulid fields", () => {
    bootstrap({ strapi });

    expect(strapi.db.lifecycles.subscribe).toHaveBeenCalledTimes(1);
    expect(strapi.db.lifecycles.subscribe).toHaveBeenCalledWith(expect.any(Function));

    const subscribeCallback = strapi.db.lifecycles.subscribe.mock.calls[0][0];
    const event = {
      action: "beforeCreate",
      model: {
        uid: "api::secondTestModel",
      },
      params: {
        data: {
          title: "name",
          uid: "another-uid"
        },
      },
    };
    subscribeCallback(event);

    expect(event.params.data.title).toBe("name");
    expect(event.params.data.uid).toBe("another-uid");
  });

  it("should generate ulid for empty ulid fields", () => {
    bootstrap({ strapi });

    expect(strapi.db.lifecycles.subscribe).toHaveBeenCalledTimes(1);
    expect(strapi.db.lifecycles.subscribe).toHaveBeenCalledWith(expect.any(Function));

    const subscribeCallback = strapi.db.lifecycles.subscribe.mock.calls[0][0];
    const event = {
      action: "beforeCreate",
      model: {
        uid: "api::thirdTestModel",
      },
      params: {
        data: {
          actualULID: "",
        },
      },
    };
    subscribeCallback(event);
    expect(!!event.params.data.actualULID).toBe(true);
  });
});
